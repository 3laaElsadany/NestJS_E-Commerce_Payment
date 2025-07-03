import { IsEnum } from "class-validator";
import { OrderStatus } from "src/utils/types";

export class updateOrderStatus {
  @IsEnum([OrderStatus.CANCELLED, OrderStatus.DELIVERED, OrderStatus.PROCESSING, OrderStatus.SHIPPED], { message: 'Invalid order status' })
  status: string;
}