// src/modules/article/article.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Provider } from 'src/provider/entities/provider.entity';

@Schema({ timestamps: true })
export class Article extends Document {
  @Prop({ required: true })
  name: string;
  @Prop()
  reference: string;
  @Prop({ required: true })
  purchasePrice: number;
   @Prop({ required: true })
  sellingrice: number;
  @Prop({ default: 0 })
  stockQuantity: number;
  @Prop({ default: 0 })
  shopQuantity: number;
  @Prop({ type: Types.ObjectId, ref: 'Fournisseur' })
  fournisseur: Provider;
  @Prop({ enum: ['key', 'keychain', 'stamp', 'other'], default: 'key' })
  type: string;

  @Prop({ enum: ['simple', 'a pointe', 'double panneton', 'Tubulaire'], default: 'simple' })
  category: string;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
