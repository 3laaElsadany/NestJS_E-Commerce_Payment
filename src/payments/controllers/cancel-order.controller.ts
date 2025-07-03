import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { StripeService } from 'src/payments/services/stripe.service';
import { PaypalService } from 'src/payments/services/paypal.service';
import { OrderResponse } from 'src/utils/types';
import { UsersGuard } from 'src/utils/guards/users.guard';
import { Roles } from 'src/utils/decorator/Roles.decorator';
import { Token } from 'src/utils/decorator/Token.decorator';

@UseGuards(UsersGuard)
@Controller('cancel-order')
export class CancelOrderController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly paypalService: PaypalService,
  ) { }

  @Roles(['user'])
  @Post(':sessionId')
  async cancelOrder(@Param('sessionId') sessionId: string, @Token() token: string): Promise<OrderResponse> {
    if (sessionId.startsWith('cs_')) {
      // Stripe session
      return await this.stripeService.cancelOrder(sessionId, token);
    } else {
      // PayPal session
      return await this.paypalService.cancelOrder(sessionId, token);
    }
  }
}
