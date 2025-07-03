import { Controller, Post, Body, Query, Get, UseGuards, Param, Redirect } from '@nestjs/common';
import { CreateStripeDto } from '../dto/createStripe.dto';
import { StripeService } from 'src/payments/services/stripe.service';
import { Roles } from 'src/utils/decorator/Roles.decorator';
import { UsersGuard } from 'src/utils/guards/users.guard';
import { Token } from 'src/utils/decorator/Token.decorator';
import { OrderResponse, CreatePayment } from 'src/utils/types';


@UseGuards(UsersGuard)
@Controller('stripe')
export class StipeController {
  constructor(private readonly stripeService: StripeService) { }

  @Roles(['user'])
  @Post()
  createStripe(@Body() OrderData: CreateStripeDto, @Token() token: string): Promise<CreatePayment> {
    return this.stripeService.createStripe(OrderData, token);
  }

  @Get('success')
  async createStripeOrder(@Query('session_id') sessionId: string): Promise<OrderResponse> {
    return this.stripeService.createStripeOrder(sessionId);
  }

  @Get('cancel')
   cancelThePayment(): { message: string } {
    return this.stripeService.cancelThePayment();
  }

}