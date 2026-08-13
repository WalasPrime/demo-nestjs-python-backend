import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBody } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiBody({
    description:
      'Returns a greeting message, and dispatches a job to the worker job queue.',
  })
  getHello() {
    return this.appService.getHello();
  }

  @Get('example-job')
  @ApiBody({
    description:
      'Dispatches an example job, waits for the result payload and returns it.',
  })
  getExample() {
    return this.appService.exampleJob();
  }
}
