import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order, OrderSchema } from 'src/utils/schema/order.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/users/users.module';
import { User, UserSchema } from 'src/utils/schema/user.schema';

@Module({
  imports: [UsersModule, MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }, { name: User.name, schema: UserSchema }])],
  controllers: [OrdersController],
  providers: [OrdersService]
})
export class OrdersModule { }