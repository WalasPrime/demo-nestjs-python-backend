import { Test, TestingModule } from '@nestjs/testing';
import { DispatcherService } from './dispatcher.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { rabbitMQMock } from '../rabbitmq/rabbitmq.mock';
import { JobMessage } from '../schemas/jobs';
import { ResultMessage } from '../schemas/results';

describe('DispatcherModule', () => {
  let app: TestingModule;
  let service: DispatcherService;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      providers: [
        DispatcherService,
        {
          provide: RabbitMQService,
          useValue: rabbitMQMock,
        },
      ],
    }).compile();

    service = app.get<DispatcherService>(DispatcherService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('job dispatching and result processing', () => {
    it('can dispatch and pass results at invocation point', async () => {
      const job: JobMessage = {
        type: 'example',
        payload: { data: 'example' },
      };
      const result: ResultMessage = {
        status: 'done',
        data: 'some result',
      };
      let resolveStatus = false;
      let resultReceived: ResultMessage;
      const dispatch = service.dispatchJobAndWait(job).then((result) => {
        resultReceived = result;
        resolveStatus = true;
      });
      const pendingIds = service.getPendingJobIds();

      expect(pendingIds).toHaveLength(1);
      expect(resolveStatus).toEqual(false);

      const id = pendingIds[0];

      result.id = id;

      await service.onResultReceived(result);
      await dispatch;

      expect(resolveStatus).toEqual(true);
      expect(resultReceived).toEqual(result);
    });
  });
});
