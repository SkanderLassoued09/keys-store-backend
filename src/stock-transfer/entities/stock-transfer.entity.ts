import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Article } from 'src/article/entities/article.entity';
import { Employee } from 'src/employee/entities/employee.entity';

export type StockTransferDocument = HydratedDocument<StockTransfer>;

@Schema({ timestamps: true })
export class StockTransfer {
  @Prop({ type: Types.ObjectId, ref: Article.name, required: true })
  article: Article;

  @Prop({ required: true, min: 1 })
  quantity: number;

  // Snapshot of stock values before/after the transfer for an audit trail.
  @Prop({ required: true })
  oldStock: number;

  @Prop({ required: true })
  newStock: number;

  @Prop({ required: true })
  oldShop: number;

  @Prop({ required: true })
  newShop: number;

  // Optional attribution. No auth system yet; the employee dropdown in the
  // modal is the closest proxy.
  @Prop({ type: Types.ObjectId, ref: Employee.name, default: null })
  employee: Employee | null;

  // Future-ready: the only flow today is Maison -> Magasin, but the schema
  // accepts arbitrary locations so multi-location can be added without a
  // migration.
  @Prop({ default: 'Maison' })
  sourceLocation: string;

  @Prop({ default: 'Magasin' })
  targetLocation: string;
}

export const StockTransferSchema = SchemaFactory.createForClass(StockTransfer);
