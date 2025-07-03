import { BadRequestException, Inject, Injectable } from '@nestjs/common';
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
  client: any;

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly productService: ProductService
  ) {
    const environment = new paypal.core.SandboxEnvironment(
      this.configService.get('PAYPAL_CLIENT_ID'),
      this.configService.get('PAYPAL_SECRET_KEY')
    );


    this.client = new paypal.core.PayPalHttpClient(environment);
  }

  async createPaypal(OrderData: CreatePaypalDto, token: string): Promise<CreatePayment> {

    const host = this.configService.get('HOST');
    const port = this.configService.get('PORT');

    const { city, line1, line2, postal_code, state, description, quantity, orderName, productId } = OrderData;

    const decodedData = await this.jwtService.verify(token);

    const product = await this.productService.getProduct(OrderData.productId) as Product;

    if (product.stock < quantity) {
      throw new BadRequestException('Insufficient stock for the requested quantity.');
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      "intent": "CAPTURE",
      "purchase_units": [{
        "amount": {
          "currency_code": "USD",
          // "currency_code": "EGP",
          "value": (product.price * quantity).toFixed(2),
        },
        description: description,
        custom_id: `${decodedData.userId}::${productId}::${orderName}::${quantity}`,
        "shipping": {
          address: {
            address_line_1: line1,
            address_line_2: line2,
            admin_area_2: city,
            admin_area_1: state,
            postal_code: postal_code,
            country_code: "EG"
          }
        }
      }],
      "application_context": {
        "return_url": `http://${host}:${port}/paypal/success`,
        "cancel_url": `http://${host}:${port}/paypal/cancel`,
        shipping_preference: "SET_PROVIDED_ADDRESS"
      }
    });

    try {
      const order = await this.client.execute(request);
      for (let i = 0; i < order.result.links.length; i++) {
        if (order.result.links[i].rel === 'approve') {
          return { paymentUrl: order.result.links[i].href };

        }
      }
    } catch (err) {
      console.error("Error details:", err);
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
      const shippingAddress = session.purchase_units[0].shipping.address;
      const customIdRaw = session.purchase_units[0].payments.captures[0].custom_id;
      const totalPrice = session.purchase_units[0].payments.captures[0].amount.value;
      const currency = capture.result.purchase_units[0].payments.captures[0].amount.currency_code.toLowerCase();
      let order = await this.orderModel.findOne({ sessionId: session.id });
      const [userId, productId, orderName, quantity] = customIdRaw.split('::');

      if (order) {
        return { message: 'Order already exists', order };
      }

      await this.productModel.findByIdAndUpdate(productId, {
        $inc: { stock: -quantity }
      })


      order = new this.orderModel({
        sessionId: session.id,
        orderName: orderName,
        email: payer.email_address,
        city: shippingAddress.admin_area_2,
        line1: shippingAddress.address_line_1,
        line2: shippingAddress.address_line_2,
        state: shippingAddress.admin_area_1,
        postalCode: shippingAddress.postal_code,
        totalPrice: totalPrice,
        userId: userId,
        quantity: quantity,
        payed: true,
        currency: currency,
        productId
      });

      await order.save();

      return { message: "Order created successfully", order };
    } catch (err) {
      console.error("Capture Error", err);
      throw new BadRequestException('Failed to capture order');
    }
  }

  cancelThePayment(): { message: string } {
    return { message: 'Payment cancelled' };
  }

  async cancelOrder(sessionId: string, token: string): Promise<OrderResponse> {
    const decodedData = await this.jwtService.verify(token);
    const order = await this.orderModel.findOne({ sessionId, userId: decodedData.userId });
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