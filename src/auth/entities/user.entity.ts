import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserRole = 'admin' | 'employee';

// Login accounts. Password is stored as an scrypt hash (salt:hash), never in
// clear. An 'employee' account is optionally linked to an Employee record so
// sales/ledger can be attributed to the authenticated person.
@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  username: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ enum: ['admin', 'employee'], default: 'employee' })
  role: UserRole;

  @Prop({ default: '' })
  displayName: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  employee: Types.ObjectId | null;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
