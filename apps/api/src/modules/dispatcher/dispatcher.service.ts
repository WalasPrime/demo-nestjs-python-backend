import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { RabbitMQClient } from '../rabbitmq/rabbitmq.module';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class DispatcherService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  constructor(@Inject(RabbitMQClient) private readonly client: ClientProxy) {}

  async dispatchJob(job: any): Promise<void> {
    Logger.debug(
      `Dispatching job: ${JSON.stringify(job)}`,
      'DispatcherService',
    );
    await lastValueFrom(this.client.emit('job_queue', job));
  }

  async onApplicationBootstrap() {
    await this.client.connect();
    Logger.debug(`Connected to RabbitMQ`, 'DispatcherService');
  }

  async onApplicationShutdown() {
    Logger.debug(`Closing broker connection`, 'DispatcherService');
    await this.client.close();
  }
}
