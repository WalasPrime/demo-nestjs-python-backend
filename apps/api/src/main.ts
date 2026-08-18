import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerService } from './modules/swagger/swagger.service';
import { OpenTelemetryService } from './modules/opentelemetry/opentelemetry.service';

async function bootstrap() {
  const otlSdk = OpenTelemetryService.initialize(); // Must be called before NestFactory.create()

  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();
  app.get(SwaggerService).initialize(app);
  app.get(OpenTelemetryService).postSetup(otlSdk);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
