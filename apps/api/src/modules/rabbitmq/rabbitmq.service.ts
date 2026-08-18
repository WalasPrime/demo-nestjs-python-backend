import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import * as amqplib from 'amqplib';
import { context, propagation } from '@opentelemetry/api';
import { ResultMessage, ResultMessageSchema } from '../schemas/results';
import { JobMessage } from '../schemas/jobs';
import { Traceable } from 'nestjs-otel';

@Injectable()
@Traceable()
export class RabbitMQService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private connection: amqplib.ChannelModel | null = null;
  private jobsChannel: amqplib.Channel | null = null;
  private resultsChannel: amqplib.Channel | null = null;
  private resultsQueue: string | null = null;

  private instanceId: string = '';

  async onApplicationBootstrap() {
    this.instanceId = this.generateId();
    this.connection = await amqplib.connect(process.env.RABBITMQ_URL ?? '');

    this.jobsChannel = await this.connection.createChannel();
    await this.jobsChannel.assertQueue('jobs', { durable: true });

    this.resultsChannel = await this.connection.createChannel();
    await this.resultsChannel.assertExchange('results_exchange', 'direct', {
      durable: true,
    });
    const { queue } = await this.resultsChannel.assertQueue('', {
      exclusive: true,
      autoDelete: true,
    });
    this.resultsQueue = queue;
    await this.resultsChannel.bindQueue(
      queue,
      'results_exchange',
      this.instanceId,
    );

    Logger.log(
      `RabbitMQService initialized as ${this.instanceId}`,
      'RabbitMQService',
    );
  }

  async onApplicationShutdown() {
    await this.connection?.close();
  }

  generateId() {
    return Math.random().toString(36).substring(2, 15);
  }

  sendJob(payload: JobMessage) {
    const headers: Record<string, string> = {};
    propagation.inject(context.active(), headers);

    this.jobsChannel?.sendToQueue(
      'jobs',
      Buffer.from(JSON.stringify({ ...payload, replyTo: this.instanceId })),
      { headers },
    );
  }

  async subscribeResults(onMessage: (msg: ResultMessage) => Promise<void>) {
    if (!this.resultsQueue) throw new Error('Results queue is not initialized');

    await this.resultsChannel?.consume(this.resultsQueue, (msg) => {
      (async () => {
        // Defer
        try {
          if (msg) {
            const content = msg.content.toString();
            const resultMessage: ResultMessage = ResultMessageSchema.parse(
              JSON.parse(content),
            );
            const parentContext = propagation.extract(
              context.active(),
              msg.properties.headers ?? {},
            );
            await context.with(parentContext, () => onMessage(resultMessage));
            this.resultsChannel?.ack(msg);
          }
        } catch (err) {
          console.error('Error processing message:', err);
        }
      })();
    });
  }
}
