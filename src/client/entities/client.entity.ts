// src/modules/client/client.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Article } from 'src/article/entities/article.entity';
import { WorkOrder } from 'src/work-order/entities/work-order.entity';

@Schema({ timestamps: true })
export class Client extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  email: string;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop({ default: 0 })
  loyaltyPoints: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Article' }] })
  purchases: Article[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'WorkOrder' }] })
  services: WorkOrder[];
}

export const ClientSchema = SchemaFactory.createForClass(Client);
