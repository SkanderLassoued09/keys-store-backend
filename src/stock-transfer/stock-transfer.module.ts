import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, ArticleSchema } from 'src/article/entities/article.entity';
import {
  StockTransfer,
  StockTransferSchema,
} from './entities/stock-transfer.entity';
import { StockTransferController } from './stock-transfer.controller';
import { StockTransferService } from './stock-transfer.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StockTransfer.name, schema: StockTransferSchema },
      // Service mutates Article atomically — register the schema here.
      { name: Article.name, schema: ArticleSchema },
    ]),
  ],
  controllers: [StockTransferController],
  providers: [StockTransferService],
})
export class StockTransferModule {}
