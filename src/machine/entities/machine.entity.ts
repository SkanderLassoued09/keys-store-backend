import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Provider } from 'src/provider/entities/provider.entity';

@Schema({ timestamps: true })
export class Machine extends Document {
  @Prop({ required: true })
  name: string;

  // Image URL or base64 data URI for the machine's visual card.
  @Prop()
  image: string;

  @Prop()
  type: string;
  @Prop()
  serialNumber: string;
  @Prop({ type: Types.ObjectId, ref: 'Provider' })
  fournisseur: Provider;

  @Prop()
  purchaseDate: Date;

  @Prop({
    enum: ['active', 'maintenance', 'retired', 'sold'],
    default: 'active',
  })
  status: string;
}

export const MachineSchema = SchemaFactory.createForClass(Machine);
