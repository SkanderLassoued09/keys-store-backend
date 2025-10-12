// src/modules/employee/employee.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { WorkOrder } from 'src/work-order/entities/work-order.entity';

@Schema({ timestamps: true })
export class Employee extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  phone: string;

  @Prop()
  hireDate: Date;

  @Prop()
  salary: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Service' }] })
  services: WorkOrder[];

  @Prop({ default: true })
  isActive: boolean;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
