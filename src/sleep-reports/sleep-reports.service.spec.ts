import { Test, TestingModule } from '@nestjs/testing';
import { SleepReportsService } from './sleep-reports.service';

describe('SleepReportsService', () => {
  let service: SleepReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SleepReportsService],
    }).compile();

    service = module.get<SleepReportsService>(SleepReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
