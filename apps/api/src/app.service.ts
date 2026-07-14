import { Inject, Injectable } from '@nestjs/common';
import { DispatcherService } from './modules/dispatcher/dispatcher.service';

@Injectable()
export class AppService {
  constructor(
    @Inject(DispatcherService)
    private readonly dispatcherService: DispatcherService,
  ) {}

  async getHello(): Promise<string> {
    await this.dispatcherService.dispatchJob({
      task: 'example',
      payload: { data: 'sample' },
    });

    return 'Hello World!';
  }
}
