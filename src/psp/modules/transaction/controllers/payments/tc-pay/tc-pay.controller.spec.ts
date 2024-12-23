import { Test, TestingModule } from '@nestjs/testing';
import { TcPayController } from './tc-pay.controller';

describe('TcPayController', () => {
  let controller: TcPayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TcPayController],
    }).compile();

    controller = module.get<TcPayController>(TcPayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
