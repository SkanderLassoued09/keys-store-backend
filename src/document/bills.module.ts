import { Module } from '@nestjs/common';
import { DocumentService } from './bills.service';
import { DocumentController } from './bills.controller';
import { Bills, Billsschema } from './entities/bills.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Bills.name, schema: Billsschema }]),
  ],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
