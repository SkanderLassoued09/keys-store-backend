// src/modules/service/service.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Client } from 'src/client/entities/client.entity';
import { Employee } from 'src/employee/entities/employee.entity';
import { Machine } from 'src/machine/entities/machine.entity';

@Schema({ timestamps: true })
export class WorkOrder extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  //   @Prop({ type: Types.ObjectId, ref: 'Category' })
  //   category: Category;

  @Prop({ required: true })
  price: number;

  @Prop()
  duration: number;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  employee: Employee;

  @Prop({ type: Types.ObjectId, ref: 'Client' })
  client: Client;

  @Prop({ type: Types.ObjectId, ref: 'Machine', default: null })
  machine: Machine;

  @Prop({ enum: ['pending', 'in-progress', 'done'], default: 'pending' })
  status: string;
}

export const WorkOrderSchema = SchemaFactory.createForClass(WorkOrder);
