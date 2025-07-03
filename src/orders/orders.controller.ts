import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UsersGuard } from 'src/utils/guards/users.guard';
import { Roles } from 'src/utils/decorator/Roles.decorator';
import { updateOrderStatus } from './dto/updateOrderStatus.dto';
import { FindAllOrdersResponse } from 'src/utils/types';
import { Order } from 'src/utils/schema/order.schema';


@UseGuards(UsersGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrdersService) { }

  @Roles(['admin', 'manager'])
  @Get()
  async getOrders(): Promise<FindAllOrdersResponse> {
    return await this.orderService.getOrders();
  }

  @Roles(['admin', 'manager'])
  @Get(':id')
  async getOrder(@Param('id') id: string): Promise<Order> {
    return await this.orderService.getOrder(id);
  }

  @Roles(['admin'])
  @Patch(':id')
  async updateOrder(@Param('id') id: string, @Body() orderStatus: updateOrderStatus): Promise<Order> {
    return await this.orderService.updateOrder(id, orderStatus);
  }

  @Roles(['admin'])
  @Delete(':id')
  async deleteOrder(@Param('id') id: string): Promise<void> {
    return await this.orderService.deleteOrder(id);
  }
}
