import { Module } from '@nestjs/common';
import { OpenTelemetryService } from './opentelemetry.service';
import { OpenTelemetryModule as NestOpenTelemetryModule } from 'nestjs-otel';

@Module({
  imports: [NestOpenTelemetryModule.forRoot()],
  providers: [OpenTelemetryService],
})
export class OpenTelemetryModule {}
