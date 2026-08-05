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
  getHello(): Promise<string> {
    return this.appService.getHello();
  }
}
