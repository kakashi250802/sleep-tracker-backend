import { Test, TestingModule } from '@nestjs/testing';
import { SleepController } from './sleep.controller';

describe('SleepController', () => {
  let controller: SleepController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SleepController],
    }).compile();

    controller = module.get<SleepController>(SleepController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
