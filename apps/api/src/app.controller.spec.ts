import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DispatcherService } from './modules/dispatcher/dispatcher.service';
import { dispatcherServiceMock } from './modules/dispatcher/dispatcher.mock';
import { afterEach } from 'node:test';
import { ResultMessage } from './modules/schemas/results';

describe('AppController', () => {
  let app: TestingModule;
  let appController: AppController;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: DispatcherService,
          useValue: dispatcherServiceMock,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('getExample', () => {
    it('should return a payload for a result', async () => {
      const dispatcher = app.get<DispatcherService>(
        DispatcherService,
      ) as typeof dispatcherServiceMock;

      let dispatchResolve: (ResultMessage) => void;

      dispatcher.dispatchJobAndWait.mockReturnValue(
        new Promise((resolve) => {
          dispatchResolve = resolve;
        }),
      );

      const query = appController.getExample();
      const result: ResultMessage = {
        status: 'done',
        data: 'some data',
      };

      setTimeout(() => {
        dispatchResolve(result);
      }, 100);

      await expect(query).resolves.toEqual(result);
    });
  });
});
