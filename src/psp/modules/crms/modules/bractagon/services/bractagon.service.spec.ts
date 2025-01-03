import { Test, TestingModule } from '@nestjs/testing';
import { BractagonService } from './bractagon.service';

describe('BractagonService', () => {
  let service: BractagonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BractagonService],
    }).compile();

    service = module.get<BractagonService>(BractagonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
