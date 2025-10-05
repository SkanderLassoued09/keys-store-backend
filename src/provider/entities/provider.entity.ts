// src/modules/fournisseur/fournisseur.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Article } from 'src/article/entities/article.entity';
import { Machine } from 'src/machine/entities/machine.entity';

@Schema({ timestamps: true })
export class Provider extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  company: string;

  @Prop()
  email: string;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Article' }] })
  articles: Article[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Machine' }] })
  machines: Machine[];
}

export const FournisseurSchema = SchemaFactory.createForClass(Provider);
