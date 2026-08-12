import { Inject, Injectable } from '@nestjs/common';
import { DispatcherService } from './modules/dispatcher/dispatcher.service';
import { JobMessage } from './modules/schemas/jobs';

@Injectable()
export class AppService {
  constructor(
    @Inject(DispatcherService)
    private readonly dispatcherService: DispatcherService,
  ) {}

  getHello() {
    const exampleJob: JobMessage = {
      type: 'example',
      payload: { data: 'sample' },
    };

    this.dispatcherService.dispatchJob(exampleJob);

    return 'Hello World!';
  }
}
