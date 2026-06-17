import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeLedgerService } from './employee-ledger.service';
import { EmployeeLedgerController } from './employee-ledger.controller';
import {
  EmployeeLedger,
  EmployeeLedgerSchema,
} from './entities/employee-ledger.entity';
import { Article, ArticleSchema } from 'src/article/entities/article.entity';
import { Employee, EmployeeSchema } from 'src/employee/entities/employee.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmployeeLedger.name, schema: EmployeeLedgerSchema },
      // Article: atomic shop-stock decrement. Employee: populate names.
      { name: Article.name, schema: ArticleSchema },
      { name: Employee.name, schema: EmployeeSchema },
    ]),
  ],
  controllers: [EmployeeLedgerController],
  providers: [EmployeeLedgerService],
})
export class EmployeeLedgerModule {}
