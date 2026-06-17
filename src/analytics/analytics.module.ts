import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { WorkOrder, WorkOrderSchema } from '../work-order/entities/work-order.entity';
import {
  EmployeeLedger,
  EmployeeLedgerSchema,
} from '../employee-ledger/entities/employee-ledger.entity';
import { WorkTask, WorkTaskSchema } from '../work-task/entities/work-task.entity';
import { Employee, EmployeeSchema } from '../employee/entities/employee.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkOrder.name, schema: WorkOrderSchema },
      { name: EmployeeLedger.name, schema: EmployeeLedgerSchema },
      { name: WorkTask.name, schema: WorkTaskSchema },
      { name: Employee.name, schema: EmployeeSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
