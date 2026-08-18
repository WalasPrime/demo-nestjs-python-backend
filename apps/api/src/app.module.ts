import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DispatcherModule } from './modules/dispatcher/dispatcher.module';
import { SwaggerModule } from './modules/swagger/swagger.module';
import { OpenTelemetryModule } from './modules/opentelemetry/opentelemetry.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DispatcherModule,
    SwaggerModule,
    OpenTelemetryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
