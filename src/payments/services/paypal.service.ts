import { BadRequestException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as paypal from '@paypal/checkout-server-sdk';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from 'src/utils/schema/order.schema';
import { CreatePaypalDto } from 'src/payments/dto/createPaypal.dto';
import { ProductService } from 'src/product/product.service';
import { Product } from 'src/utils/schema/product.schema';
import { OrderResponse, CreatePayment } from 'src/utils/types';

@Injectable()
export class PaypalService {
  private readonly client: paypal.core.PayPalHttpClient;

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly productService: ProductService,
  ) {
    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const secret = this.configService.get<string>('PAYPAL_SECRET_KEY');
    const mode = this.configService.get<string>('MODE');

    const environment =
      mode === 'live'
        ? new paypal.core.LiveEnvironment(clientId, secret)
        : new paypal.core.SandboxEnvironment(clientId, secret);

    this.client = new paypal.core.PayPalHttpClient(environment);
  }

  async createPaypal(OrderData: CreatePaypalDto, token: string): Promise<CreatePayment> {
    const mode = this.configService.get<string>('MODE');
    const isProd = mode === 'live';

    const {
      city,
      line1,
      line2,
      postal_code,
      state,
      description,
      quantity,
      orderName,
      productId,
    } = OrderData;

    const decodedData = await this.jwtService.verifyAsync(token);

    const product = await this.productService.getProduct(productId);
    if (!product) {
      throw new BadRequestException('Product not found.');
    }

    if (product.stock < quantity) {
      throw new BadRequestException('Insufficient stock for the requested quantity.');
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: (product.price * quantity).toFixed(2),
          },
          description,
          custom_id: `${decodedData.userId}::${productId}::${orderName}::${quantity}`,
          shipping: {
            address: {
              address_line_1: line1,
              address_line_2: line2,
              admin_area_2: city,
              admin_area_1: state,
              postal_code: postal_code,
              country_code: 'EG',
            },
          },
        },
      ],
      application_context: {
        return_url: `${this.configService.get('BASE_URL')}/paypal/success`,
        cancel_url: `${this.configService.get('BASE_URL')}/paypal/cancel`,
        shipping_preference: 'SET_PROVIDED_ADDRESS',
      },
    });

    try {
      const order = await this.client.execute(request);
      const approveLink = order.result.links.find(link => link.rel === 'approve');
      if (approveLink) {
        return { paymentUrl: approveLink.href };
      } else {
        throw new Error('No approval link found.');
      }
    } catch (err) {
      console.error('Error details:', err);
      throw new BadRequestException('Error creating PayPal order.');
    }
  }

  async createPaypalOrder(data): Promise<OrderResponse> {
    const captureRequest = new paypal.orders.OrdersCaptureRequest(data.token);
    captureRequest.requestBody({});

    try {
      const capture = await this.client.execute(captureRequest);

      const session = capture.result;
      const purchase = session.purchase_units[0];
      const payer = session.payer;
      const shippingAddress = purchase.shipping.address;
      const paymentInfo = purchase.payments.captures[0];

      const customIdRaw = paymentInfo.custom_id;
      const totalPrice = paymentInfo.amount.value;
      const currency = paymentInfo.amount.currency_code.toLowerCase();
      const [userId, productId, orderName, quantity] = customIdRaw.split('::');

      let order = await this.orderModel.findOne({ sessionId: session.id });
      if (order) {
        return { message: 'Order already exists', order };
      }

      await this.productModel.findByIdAndUpdate(productId, {
        $inc: { stock: -Number(quantity) },
      });

      order = new this.orderModel({
        sessionId: session.id,
        orderName,
        email: payer.email_address,
        city: shippingAddress.admin_area_2,
        line1: shippingAddress.address_line_1,
        line2: shippingAddress.address_line_2,
        state: shippingAddress.admin_area_1,
        postalCode: shippingAddress.postal_code,
        totalPrice,
        userId,
        quantity,
        payed: true,
        currency,
        productId,
      });

      await order.save();

      return { message: 'Order created successfully', order };
    } catch (err) {
      console.error('Capture Error', err);
      throw new BadRequestException('Failed to capture order');
    }
  }

  cancelThePayment(): { message: string } {
    return { message: 'Payment cancelled' };
  }

  async cancelOrder(sessionId: string, token: string): Promise<OrderResponse> {
    const decodedData = await this.jwtService.verifyAsync(token);
    const order = await this.orderModel.findOne({
      sessionId,
      userId: decodedData.userId,
    });

    if (!order) throw new BadRequestException('Order not found');
    if (order.status === 'cancelled') throw new BadRequestException('Order already cancelled');

    const getRequest = new paypal.orders.OrdersGetRequest(sessionId);
    const getResponse = await this.client.execute(getRequest);

    const captureId = getResponse.result.purchase_units[0].payments.captures[0].id;
    const refundRequest = new paypal.payments.CapturesRefundRequest(captureId);
    refundRequest.requestBody({});

    await this.client.execute(refundRequest);

    order.status = 'cancelled';
    await order.save();

    return { message: 'Order cancelled', order };
  }
}

