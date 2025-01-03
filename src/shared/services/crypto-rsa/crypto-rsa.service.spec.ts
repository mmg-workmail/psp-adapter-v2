import { Test, TestingModule } from '@nestjs/testing';
import { CryptoRsaService } from './crypto-rsa.service';

describe('CryptoRsaService', () => {
  let service: CryptoRsaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoRsaService],
    }).compile();

    service = module.get<CryptoRsaService>(CryptoRsaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
