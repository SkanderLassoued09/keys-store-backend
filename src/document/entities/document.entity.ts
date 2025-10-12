// src/modules/employee/employee.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Employee extends Document {
  @Prop({ required: true })
  content: string;


}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
