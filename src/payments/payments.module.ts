import { Module } from '@nestjs/common';
import { Order, OrderSchema } from 'src/utils/schema/order.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PaypalController } from '../payments/controllers/paypal.controller';
import { StipeController } from '../payments/controllers/stripe.controller';
import { PaypalService } from '../payments/services/paypal.service';
import { StripeService } from '../payments/services/stripe.service';
import { UsersModule } from 'src/users/users.module';
import { CancelOrderController } from './controllers/cancel-order.controller';
import { ProductModule } from 'src/product/product.module';
import { Product, ProductSchema } from 'src/utils/schema/product.schema';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  imports: [UsersModule, ProductModule, MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }, { name: Product.name, schema: ProductSchema }])],
  controllers: [PaypalController, StipeController, CancelOrderController],
  providers: [PaypalService, StripeService]
})
export class PaymentsModule { }