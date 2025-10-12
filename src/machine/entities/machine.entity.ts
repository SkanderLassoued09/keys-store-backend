import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Provider } from 'src/provider/entities/provider.entity';


@Schema({ timestamps: true })
export class Machine extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  type: string;
  @Prop()
  serialNumber: string;
  @Prop({ type: Types.ObjectId, ref: 'Fournisseur' })
  fournisseur: Provider;

  @Prop()
  purchaseDate: Date;

  @Prop({ enum: ['active', 'maintenance', 'retired','sold'], default: 'active' })
  status: string;

  
}

export const MachineSchema = SchemaFactory.createForClass(Machine);
