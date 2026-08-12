import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class DispatcherService implements OnApplicationBootstrap {
  constructor(private readonly client: RabbitMQService) {}

  dispatchJob(job: any) {
    Logger.debug(
      `Dispatching job: ${JSON.stringify(job)}`,
      'DispatcherService',
    );

    this.client.sendJob(JSON.stringify(job));
  }

  onApplicationBootstrap() {
    this.client.subscribeResults(async (result) => {
      Logger.debug(
        `Got result: ${JSON.stringify(result)}`,
        'DispatcherService',
      );
    });
  }
}
