import { Inject, Injectable } from '@nestjs/common';
import { DispatcherService } from './modules/dispatcher/dispatcher.service';
import { JobMessage } from './modules/schemas/jobs';

@Injectable()
export class AppService {
  constructor(
    @Inject(DispatcherService)
    private readonly dispatcherService: DispatcherService,
  ) {}

  async getHello(): Promise<string> {
    const exampleJob: JobMessage = {
      type: 'example',
      payload: { data: 'sample' },
    };

    await this.dispatcherService.dispatchJob(exampleJob);

    return 'Hello World!';
  }
}
