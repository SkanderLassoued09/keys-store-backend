import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Employee } from 'src/employee/entities/employee.entity';
import { Provider } from 'src/provider/entities/provider.entity';

@Schema({ timestamps: true })
export class Bills extends Document {
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  description: string;
  @Prop({ required: true })
  type: string;
  @Prop({ type: Types.ObjectId, ref: 'Fournisseur' })
  fournisseur: Provider;
  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  employee: Employee;
}

export const Billschema = SchemaFactory.createForClass(Bills);
