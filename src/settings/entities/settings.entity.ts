import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Single-document app settings. Holds the global service commission rate
// applied to services performed by employees (e.g. 10% of a 100 DT service).
@Schema({ timestamps: true })
export class Settings extends Document {
  @Prop({ default: 0, min: 0 })
  serviceCommissionPercent: number;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
