import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, ArticleSchema } from 'src/article/entities/article.entity';
import { WorkOrder, WorkOrderSchema } from 'src/work-order/entities/work-order.entity';
import { ArticleReturnController } from './article-return.controller';
import { ArticleReturnService } from './article-return.service';
import {
  ArticleReturn,
  ArticleReturnSchema,
} from './entities/article-return.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ArticleReturn.name, schema: ArticleReturnSchema },
      { name: Article.name, schema: ArticleSchema },
      { name: WorkOrder.name, schema: WorkOrderSchema },
    ]),
  ],
  controllers: [ArticleReturnController],
  providers: [ArticleReturnService],
})
export class ArticleReturnModule {}
