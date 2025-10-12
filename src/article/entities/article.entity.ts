// src/modules/article/article.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Provider } from 'src/provider/entities/provider.entity';

@Schema({ timestamps: true })
export class Article extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  //   @Prop({ type: Types.ObjectId, ref: 'Category' })
  //   category: Category;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 0 })
  stock: number;

  @Prop({ type: Types.ObjectId, ref: 'Fournisseur' })
  fournisseur: Provider;

  @Prop({ enum: ['key', 'keychain', 'stamp', 'other'], default: 'key' })
  type: string;

  @Prop()
  image: string;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
