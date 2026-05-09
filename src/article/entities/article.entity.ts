// src/modules/article/article.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { Provider } from 'src/provider/entities/provider.entity';
export type ArticleDocument = HydratedDocument<Article>;

@Schema({ timestamps: true })
export class Article {
  @Prop({ required: true })
  name: string;

  @Prop()
  reference?: string;

  @Prop({ required: true })
  purchasePrice: number;

  @Prop({ required: true })
  sellingPrice: number;

  @Prop({ default: 0 })
  stockQuantity: number;

  @Prop({ default: 0 })
  shopQuantity: number;

  @Prop({ type: Types.ObjectId, ref: Provider.name })
  fournisseur?: Provider;

  @Prop({
    // enum: ['key', 'keychain', 'stamp', 'carKeys', 'remote', 'other'],
    // default: 'key',
  })
  type: string;

  // Admin-toggled flag for the order-service "quick access" banner.
  @Prop({ default: false })
  featured: boolean;

  // Employee commission percentage (e.g. 1, 1.5, 2.25). Snapshotted onto each
  // WorkOrder line at sale time so historical orders preserve their rate.
  @Prop({ default: 0, min: 0 })
  commissionPercent: number;

  @Prop({
    // enum: [
    //   '4911',
    //   '4912',
    //   '4913',
    //   'R-30',
    //   'R40',
    //   'dateur',
    //   'RIB',
    //   'rubber',
    //   'other',
    // ],
    // default: 'rubber',
  })
  stamp: string;

  @Prop({
    // enum: [
    //   'universelle-bleu',
    //   'selca-L',
    //   'selca-V',
    //   'somfy',
    //   'sommer',
    //   'nice',
    //   'bennica',
    //   'other',
    // ],
    // default: 'universelle-bleu',
  })
  remote: string;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
