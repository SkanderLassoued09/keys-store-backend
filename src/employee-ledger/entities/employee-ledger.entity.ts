import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Employee } from 'src/employee/entities/employee.entity';
import { Article } from 'src/article/entities/article.entity';

export type LedgerType = 'MATERIAL_BORROW' | 'PERSONAL_USE' | 'SALARY_ADVANCE';

@Schema({ timestamps: true })
export class EmployeeLedger extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employee: Employee;

  @Prop({
    enum: ['MATERIAL_BORROW', 'PERSONAL_USE', 'SALARY_ADVANCE'],
    required: true,
  })
  type: LedgerType;

  // Only set for the stock-affecting types (MATERIAL_BORROW / PERSONAL_USE).
  @Prop({ type: Types.ObjectId, ref: 'Article', default: null })
  article: Article | null;

  @Prop({ default: 0, min: 0 })
  quantity: number;

  // Money value: the article cost for stock movements, or the advance amount
  // for SALARY_ADVANCE.
  @Prop({ default: 0, min: 0 })
  amount: number;

  @Prop()
  notes: string;

  @Prop({ default: Date.now })
  date: Date;
}

export const EmployeeLedgerSchema = SchemaFactory.createForClass(EmployeeLedger);
