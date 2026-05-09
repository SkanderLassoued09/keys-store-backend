// src/modules/service/service.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Article } from 'src/article/entities/article.entity';
import { Client } from 'src/client/entities/client.entity';
import { Employee } from 'src/employee/entities/employee.entity';
import { Machine } from 'src/machine/entities/machine.entity';

export type WorkOrderEntryType = 'article' | 'service';

@Schema({ timestamps: true })
export class WorkOrder extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;

  @Prop()
  duration: string;

  // Drives commission rate (1% article / 10% service) and revenue breakdown.
  // Defaulted to 'article' so historical rows behave as articles without backfill.
  @Prop({ enum: ['article', 'service'], default: 'article' })
  entryType: WorkOrderEntryType;

  @Prop({ type: Types.ObjectId, ref: 'Article', default: null })
  article: Article;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  employee: Employee;

  @Prop({ type: Types.ObjectId, ref: 'Client' })
  client: Client;

  @Prop({ type: Types.ObjectId, ref: 'Machine', default: null })
  machine: Machine;

  @Prop({ enum: ['pending', 'in-progress', 'done'], default: 'pending' })
  status: string;

  // Snapshotted at sale time. For article entries, copied from the parent
  // Article. For service entries, set in the Créer Service modal. Storing
  // both percent and computed prime keeps reports stable if the article's
  // rate is later changed.
  @Prop({ default: 0, min: 0 })
  commissionPercent: number;

  @Prop({ default: 0, min: 0 })
  calculatedPrime: number;
}

export const WorkOrderSchema = SchemaFactory.createForClass(WorkOrder);
