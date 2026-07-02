import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ArticleModule } from './article/article.module';
import { MachineModule } from './machine/machine.module';
import { EmployeeModule } from './employee/employee.module';
import { ProviderModule } from './provider/provider.module';
import { ClientModule } from './client/client.module';
import { DocumentModule } from './document/bills.module';
import { WorkOrderModule } from './work-order/work-order.module';
import { StockTransferModule } from './stock-transfer/stock-transfer.module';
import { ArticleReturnModule } from './article-return/article-return.module';
import { CategoryModule } from './category/category.module';
import { SubCategoryModule } from './sub-category/sub-category.module';
import { EmployeeLedgerModule } from './employee-ledger/employee-ledger.module';
import { WorkTaskModule } from './work-task/work-task.module';
import { SettingsModule } from './settings/settings.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Default targets the Docker "mongodb" service on the hostglobal network.
    // For local (non-Docker) runs, set MONGO_URI in .env (e.g. 127.0.0.1:27017).
    MongooseModule.forRoot(
      process.env.MONGO_URI ||
        'mongodb://admin:admin@mongodb:27017/keysstore?authSource=keysstore',
    ),
    ArticleModule,
    MachineModule,
    EmployeeModule,
    ProviderModule,
    ClientModule,
    DocumentModule,
    WorkOrderModule,
    StockTransferModule,
    ArticleReturnModule,
    CategoryModule,
    SubCategoryModule,
    EmployeeLedgerModule,
    WorkTaskModule,
    SettingsModule,
    AnalyticsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
