import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { UserRole } from '../types';

export type UserDocument = mongoose.HydratedDocument<User>

@Schema()
export class User {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ unique: true })
  email: string;


  @Prop()
  password: string;

  @Prop({ enum: UserRole, default: UserRole.USER })
  role: string;

}

export const UserSchema = SchemaFactory.createForClass(User);
