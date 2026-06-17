import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Employee } from 'src/employee/entities/employee.entity';

export type WorkTaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

@Schema({ timestamps: true })
export class WorkTask extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({
    enum: ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'],
    default: 'TODO',
  })
  status: WorkTaskStatus;

  @Prop({ enum: ['low', 'medium', 'high'], default: 'medium' })
  priority: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  employee: Employee | null;

  @Prop({ default: null })
  dueDate: Date;
}

export const WorkTaskSchema = SchemaFactory.createForClass(WorkTask);
