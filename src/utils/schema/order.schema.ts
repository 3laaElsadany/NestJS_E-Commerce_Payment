
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';
import { OrderStatus } from '../types';
import { Product } from './product.schema';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
  @Prop()
  sessionId: string;

  @Prop()
  email: string;

  @Prop()
  city: string;

  @Prop()
  line1: string;

  @Prop()
  line2: string;

  @Prop()
  state: string;

  @Prop()
  postalCode: string;

  @Prop()
  totalPrice: string;

  @Prop()
  quantity: string;

  @Prop()
  orderName: string;

  @Prop()
  currency: string;

  @Prop({ type: Boolean, default: false })
  payed: boolean;

  @Prop({ enum: OrderStatus, default: OrderStatus.PROCESSING })
  status: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
  productId: Product;
}

export const OrderSchema = SchemaFactory.createForClass(Order);