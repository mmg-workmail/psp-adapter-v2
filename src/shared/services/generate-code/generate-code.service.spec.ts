import { Test, TestingModule } from '@nestjs/testing';
import { GenerateCodeService } from './generate-code.service';

describe('GenerateCodeService', () => {
  let service: GenerateCodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GenerateCodeService],
    }).compile();

    service = module.get<GenerateCodeService>(GenerateCodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
