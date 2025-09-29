import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrderController } from './work-order.controller';
import { WorkOrderService } from './work-order.service';

describe('WorkOrderController', () => {
  let controller: WorkOrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkOrderController],
      providers: [WorkOrderService],
    }).compile();

    controller = module.get<WorkOrderController>(WorkOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
