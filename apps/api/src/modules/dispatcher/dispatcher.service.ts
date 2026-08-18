import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { JobMessage } from '../schemas/jobs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ResultMessage } from '../schemas/results';
import { Traceable } from 'nestjs-otel';

export type JobIdentifier = string;
type DispatchMap = { [key: string]: EventEmitter2 };

export class DispatchAbortedError extends Error {}

@Injectable()
@Traceable()
export class DispatcherService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  constructor(private readonly client: RabbitMQService) {}

  private pendingDispatches: DispatchMap = {};

  generateId() {
    return Math.random().toString(36).substring(2, 15);
  }

  onApplicationBootstrap() {
    this.client.subscribeResults((result) => {
      return this.onResultReceived(result);
    });
  }

  async onResultReceived(result: ResultMessage) {
    Logger.debug(
      `Got result to job ${result.id}: ${JSON.stringify(result)}`,
      'DispatcherService',
    );

    const id = result.id;

    if (id && this.pendingDispatches[id]) {
      try {
        await this.pendingDispatches[id].emitAsync('result', result);
      } finally {
        this.pendingDispatches[id].removeAllListeners();
        delete this.pendingDispatches[id];
      }
    }
  }

  onApplicationShutdown() {
    Object.values(this.pendingDispatches).forEach((emitter) => {
      // TODO: Could also wait for all results and then prevent new dispatches
      emitter.emit('abort');
      emitter.removeAllListeners();
    });
  }

  dispatchJob(job: JobMessage) {
    const id = this.generateId();

    Logger.debug(
      `Dispatching job with id ${id}: ${JSON.stringify(job)}`,
      'DispatcherService',
    );
    job.id = id;

    this.client.sendJob(job);
    this.pendingDispatches[id] = new EventEmitter2();

    return id;
  }

  async dispatchJobAndWait(job: JobMessage) {
    const id = this.dispatchJob(job);

    return new Promise(
      (
        resolve: (result: ResultMessage) => void,
        reject: (error: Error) => void,
      ) => {
        this.pendingDispatches[id].once('abort', () => {
          reject(new DispatchAbortedError());
        });

        this.pendingDispatches[id].once('result', (result: ResultMessage) => {
          resolve(result);
        });
      },
    );
  }

  getPendingJobIds() {
    return Object.keys(this.pendingDispatches);
  }
}
