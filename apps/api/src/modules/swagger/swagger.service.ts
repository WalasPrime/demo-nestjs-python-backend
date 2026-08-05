import { INestApplication, Injectable } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

@Injectable()
export class SwaggerService {
  initialize(app: INestApplication) {
    const config = new DocumentBuilder()
      .setTitle('demo-nestjs-python-backend')
      .setDescription(
        'The description of the demo NestJS + Python backend project',
      )
      .setVersion('1.0')
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, documentFactory);
  }
}
