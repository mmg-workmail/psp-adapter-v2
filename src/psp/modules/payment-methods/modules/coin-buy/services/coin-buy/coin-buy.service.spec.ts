import { Test, TestingModule } from '@nestjs/testing';
import { CoinBuyService } from './coin-buy.service';

describe('CoinBuyService', () => {
  let service: CoinBuyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoinBuyService],
    }).compile();

    service = module.get<CoinBuyService>(CoinBuyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
