import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import {
  ResultMessage,
  ResultMessageSchema,
} from '../src/modules/schemas/results';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  // TODO: Re-enable after fixing result dispatch to a random api instance rather than the specific one
  xit('/example-job (GET)', () => {
    return request(app.getHttpServer())
      .get('/example-job')
      .expect(200)
      .expect((res) => {
        const result: ResultMessage = ResultMessageSchema.safeParse(res.text);

        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('id');
      });
  });
});
