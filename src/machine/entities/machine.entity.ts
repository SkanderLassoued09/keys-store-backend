// src/modules/machine/machine.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Employee } from 'src/employee/entities/employee.entity';
import { Provider } from 'src/provider/entities/provider.entity';
// import { Fournisseur } from '../../fournisseur/fournisseur.schema';
// import { Employee } from '../../employee/employee.schema';

@Schema({ timestamps: true })
export class Machine extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  type: string;

  //   @Prop()
  //   model: string;

  @Prop()
  serialNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Fournisseur' })
  fournisseur: Provider;

  @Prop()
  purchaseDate: Date;

  @Prop({ enum: ['active', 'maintenance', 'retired'], default: 'active' })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  assignedTo: Employee;
}

export const MachineSchema = SchemaFactory.createForClass(Machine);
