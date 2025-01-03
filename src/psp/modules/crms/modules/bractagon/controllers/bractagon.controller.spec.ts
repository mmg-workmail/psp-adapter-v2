import { Test, TestingModule } from '@nestjs/testing';
import { BractagonController } from './bractagon.controller';

describe('BractagonController', () => {
  let controller: BractagonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BractagonController],
    }).compile();

    controller = module.get<BractagonController>(BractagonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
