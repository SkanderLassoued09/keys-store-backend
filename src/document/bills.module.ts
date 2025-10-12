import { Module } from '@nestjs/common';
import { DocumentService } from './bills.service';
import { DocumentController } from './bills.controller';

@Module({
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
