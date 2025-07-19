import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateStripeDto } from '../dto/createStripe.dto';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from 'src/utils/schema/order.schema';
import { PaypalService } from './paypal.service';
import { ProductService } from 'src/product/product.service';
import { Product } from 'src/utils/schema/product.schema';
import { CreatePayment, OrderResponse } from 'src/utils/types';
import { OrdersService } from 'src/orders/orders.service';


@Injectable()
export class StripeService {
  stripe: Stripe;
  client: any;

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly paypalService: PaypalService,
    private readonly productService: ProductService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'));
  }

  async createStripe(orderData: CreateStripeDto, token: string): Promise<CreatePayment> {

    const decodedData = await this.jwtService.verify(token);

    const product = await this.productService.getProduct(orderData.productId) as Product;

    if (product.stock < orderData.quantity || product.stock <= 0) {
      throw new BadRequestException('Insufficient stock for the requested quantity.');
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      shipping_address_collection: {
        allowed_countries: ['EG']
      },
      line_items: [
        {
          price_data: {
            currency: 'egp',
            unit_amount: product.price * 100,
            product_data: {
              name: orderData.orderName,
              description: orderData.description,
              images: [orderData.logo],
            },
          },
          quantity: orderData.quantity,
        },
      ],
      metadata: {
        productId: orderData.productId,
        orderName: orderData.orderName
      },
      mode: 'payment',
      success_url: `${this.configService.get('BASE_URL')}/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get('BASE_URL')}/stripe/cancel`,
      client_reference_id: decodedData.userId,
      customer_email: decodedData.email
    });

    return { paymentUrl: session.url };
  }


  async createStripeOrder(sessionId): Promise<OrderResponse> {

    try {

      const result = await Promise.all([
        this.stripe.checkout.sessions.retrieve(sessionId),
        this.stripe.checkout.sessions.listLineItems(sessionId)
      ]);

      const session = result[0];
      const lineItems = result[1]?.data;
      const currency = lineItems[0].currency.toLowerCase();

      let order = await this.orderModel.findOne({ sessionId: session.id });

      if (order) {
        return { message: 'Order already exists', order };
      }

      await this.productModel.findByIdAndUpdate(session.metadata.productId, {
        $inc: { stock: -lineItems[0].quantity }
      })

      if (session.payment_status === 'paid' || lineItems.length != 0) {
        order = new this.orderModel({
          sessionId: session.id,
          orderName: session.metadata.orderName,
          email: session.customer_email,
          city: session.customer_details.address.city,
          line1: session.customer_details.address.line1,
          line2: session.customer_details.address.line2,
          state: session.customer_details.address.state,
          postalCode: session.customer_details.address.postal_code,
          totalPrice: lineItems[0].amount_total / 100,
          userId: session.client_reference_id,
          quantity: lineItems[0].quantity,
          payed: true,
          currency,
          productId: session.metadata.productId
        });

        await order.save();
        return { message: 'Order created successfully', order };
      } else {
        throw new BadRequestException('No items found in checkout session.');
      }
    } catch (err) {
      throw new BadRequestException('Error confirming payment.');
    }
  }

  cancelThePayment(): { message: string } {
    return this.paypalService.cancelThePayment();
  }

  async cancelOrder(sessionId: string, token: string): Promise<OrderResponse> {
    const decodedData = await this.jwtService.verify(token);
    const order = await this.orderModel.findOne({ sessionId, userId: decodedData.userId });
    if (!order) throw new BadRequestException('Order not found');
    if (order.status === 'cancelled') throw new BadRequestException('Order already cancelled');

    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    const paymentIntentId = session.payment_intent as string;

    await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    order.status = 'cancelled';
    await order.save();

    return { message: 'Order cancelled', order };
  }
}
