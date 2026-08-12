import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerService } from './modules/swagger/swagger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();
  app.get(SwaggerService).initialize(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
