import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import * as amqplib from 'amqplib';
import { ResultMessage, ResultMessageSchema } from '../schemas/results';

@Injectable()
export class RabbitMQService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private connection: amqplib.ChannelModel | null = null;
  private jobsChannel: amqplib.Channel | null = null;
  private resultsChannel: amqplib.Channel | null = null;

  async onApplicationBootstrap() {
    this.connection = await amqplib.connect(process.env.RABBITMQ_URL ?? '');

    this.jobsChannel = await this.connection.createChannel();
    await this.jobsChannel.assertQueue('jobs', { durable: true });

    this.resultsChannel = await this.connection.createChannel();
    await this.resultsChannel.assertQueue('results', { durable: true });
  }

  async onApplicationShutdown() {
    await this.connection?.close();
  }

  sendJob(payload: string) {
    this.jobsChannel?.sendToQueue('jobs', Buffer.from(payload));
  }

  async subscribeResults(onMessage: (msg: ResultMessage) => Promise<void>) {
    await this.resultsChannel?.consume('results', (msg) => {
      (async () => {
        // Defer
        try {
          if (msg) {
            const content = msg.content.toString();
            const resultMessage: ResultMessage = ResultMessageSchema.parse(
              JSON.parse(content),
            );
            await onMessage(resultMessage);
            this.resultsChannel?.ack(msg);
          }
        } catch (err) {
          console.error('Error processing message:', err);
        }
      })();
    });
  }
}
