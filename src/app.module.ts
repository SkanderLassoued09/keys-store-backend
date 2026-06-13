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

@Module({
  imports: [
    MongooseModule.forRoot(
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
