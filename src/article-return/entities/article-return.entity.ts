import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Article } from 'src/article/entities/article.entity';
import { Employee } from 'src/employee/entities/employee.entity';
import { WorkOrder } from 'src/work-order/entities/work-order.entity';

export type ArticleReturnDocument = HydratedDocument<ArticleReturn>;
export type ArticleReturnType = 'REPAIRED' | 'REPLACED' | 'REFUNDED';

@Schema({ timestamps: true })
export class ArticleReturn {
  @Prop({ type: Types.ObjectId, ref: WorkOrder.name, default: null })
  originalWorkOrder: WorkOrder | null;

  @Prop({ type: Types.ObjectId, ref: Article.name, required: true })
  originalArticle: Article;

  @Prop()
  customerName: string;

  @Prop({ type: Types.ObjectId, ref: Employee.name, required: true })
  employee: Employee;

  @Prop({ default: Date.now })
  returnDate: Date;

  @Prop({ enum: ['REPAIRED', 'REPLACED', 'REFUNDED'], required: true })
  returnType: ArticleReturnType;

  @Prop()
  notes: string;

  @Prop()
  repairAction: string;

  @Prop({ type: Types.ObjectId, ref: Article.name, default: null })
  replacementArticle: Article | null;

  @Prop({ default: 0, min: 0 })
  replacementQuantity: number;

  @Prop({ default: 0, min: 0 })
  refundedAmount: number;

  @Prop({ default: 0 })
  revenueImpact: number;
}

export const ArticleReturnSchema = SchemaFactory.createForClass(ArticleReturn);
