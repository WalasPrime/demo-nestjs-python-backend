import { Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

export const RabbitMQClient = Symbol('RabbitMQClient');

@Module({
  providers: [
    {
      provide: RabbitMQClient,
      useFactory: () =>
        ClientProxyFactory.create({
          transport: Transport.RMQ,
          // TODO: Use the ConfigService
          options: {
            urls: [process.env.RABBITMQ_URL ?? ''],
            queue: 'jobs',
            queueOptions: { durable: true },
          },
        }),
    },
  ],
  exports: [RabbitMQClient],
})
export class RabbitMQModule {}
