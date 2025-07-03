import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from 'src/utils/schema/order.schema';
import { updateOrderStatus } from './dto/updateOrderStatus.dto';
import { User } from 'src/utils/schema/user.schema';
import { FindAllOrdersResponse, OrderStatus } from 'src/utils/types';

@Injectable()
export class OrdersService {

  constructor(@InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(User.name) private userModel: Model<User>) { }


  async getOrders(): Promise<FindAllOrdersResponse> {
    const orders = await this.orderModel.find();;
    return {
      count: orders.length,
      orders
    }
  }

  async getOrder(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).populate('userId');
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`)
    }
    return order;
  }

  async updateOrder(id: string, orderStatus: updateOrderStatus): Promise<Order> {
    let order = await this.orderModel.findByIdAndUpdate(id, { status: orderStatus.status }, { new: true })
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`)
    }
    return order;
  }

  async deleteOrder(id: string): Promise<void> {
    const order = await this.orderModel.findOne({ _id: id });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`)
    }
    if (order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('Order can not be deleted');
    }

    await this.orderModel.findByIdAndDelete(id)
  }
}
