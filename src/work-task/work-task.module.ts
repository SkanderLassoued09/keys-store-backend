import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkTaskService } from './work-task.service';
import { WorkTaskController } from './work-task.controller';
import { WorkTask, WorkTaskSchema } from './entities/work-task.entity';
import { Employee, EmployeeSchema } from 'src/employee/entities/employee.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkTask.name, schema: WorkTaskSchema },
      // Registered so populate('employee') resolves assignee names.
      { name: Employee.name, schema: EmployeeSchema },
    ]),
  ],
  controllers: [WorkTaskController],
  providers: [WorkTaskService],
})
export class WorkTaskModule {}
