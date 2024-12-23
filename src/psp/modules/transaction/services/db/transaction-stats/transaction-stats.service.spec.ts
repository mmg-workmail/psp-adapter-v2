import { Test, TestingModule } from '@nestjs/testing';
import { TransactionStatsService } from './transaction-stats.service';

describe('TransactionStatsService', () => {
  let service: TransactionStatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionStatsService],
    }).compile();

    service = module.get<TransactionStatsService>(TransactionStatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
