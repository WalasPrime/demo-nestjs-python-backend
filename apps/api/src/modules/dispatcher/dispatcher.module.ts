import { Module } from '@nestjs/common';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { DispatcherService } from './dispatcher.service';

@Module({
  imports: [RabbitMQModule],
  providers: [DispatcherService],
  exports: [DispatcherService],
})
export class DispatcherModule {}
