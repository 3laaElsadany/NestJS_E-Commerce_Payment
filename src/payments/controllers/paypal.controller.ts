import { Controller, Post, Body, Query, Get, UseGuards, Param } from '@nestjs/common';
import { CreatePaypalDto } from 'src/payments/dto/createPaypal.dto';
import { PaypalService } from 'src/payments/services/paypal.service';
import { Roles } from 'src/utils/decorator/Roles.decorator';
import { Token } from 'src/utils/decorator/Token.decorator';
import { UsersGuard } from 'src/utils/guards/users.guard';
import { OrderResponse, CreatePayment } from 'src/utils/types';


@UseGuards(UsersGuard)
@Controller('paypal')
export class PaypalController {
  constructor(private readonly paypalService: PaypalService) { }

  @Roles(['user'])
  @Post()
  createPaypal(@Body() OrderData: CreatePaypalDto, @Token() token: string): Promise<CreatePayment> {
    return this.paypalService.createPaypal(OrderData, token);
  }

  @Get('success')
  async createPaypalOrder(@Query() data): Promise<OrderResponse> {
    return this.paypalService.createPaypalOrder(data);
  }

  @Get('cancel')
  cancelThePayment(): { message: string } {
    return this.paypalService.cancelThePayment();
  }

}