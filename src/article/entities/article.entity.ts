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
  sellingPrice: number;
  @Prop({ default: 0 })
  stockQuantity: number;
  @Prop({ default: 0 })
  shopQuantity: number;
  @Prop({ type: Types.ObjectId, ref: 'Fournisseur' })
  fournisseur: Provider;
  @Prop({ enum: ['key', 'keychain', 'stamp','carKeys','remote', 'other'], default: 'key' })
  type: string;
  // type will dictate which of the following properties are used
  @Prop({ enum: ['simple', 'a pointe', 'double panneton', 'Tubulaire'], default: 'simple' })
  keyCategory: string; // only used if type is 'key'
  @Prop({ enum: ['VVDI','Smart VVDI','433Mhz-commande', '315Mhz-commande','other'], default: 'VVDI' })
  carkeyCategory: string; // only used if type is 'car keys'
  @Prop({ enum: ['4911','4912','4913', 'R-30','R40','dateur','RIB','rubber','other'], default: 'rubber' })
  stamp: string; // only used if type is 'stamp'
  @Prop({ enum: ['universelle-bleu','selca-L','selca-V', 'somfy','sommer','nice','bennica','other','other'], default: 'universelle-bleu' })
  remote: string; // only used if type is 'stamp'
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
