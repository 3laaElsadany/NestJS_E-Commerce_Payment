import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateStripeDto {
  @IsString({ message: 'Description must be string' })
  @IsOptional()
  description: string;

  @IsString({ message: 'Order_Name must be string' })
  @IsNotEmpty({ message: 'OrderName is required' })
  orderName: string;

  @IsString({ message: 'Logo Link must be string' })
  @IsNotEmpty({ message: 'Logo Link is required' })
  logo: string;

  @IsNumber({}, { message: 'Quantity must be number' })
  @IsPositive({ message: 'Quantity must be positive' })
  @IsNotEmpty({ message: 'Quantity is required' })
  quantity: number;

  @IsString({ message: 'ProductId must be string' })
  @IsNotEmpty({ message: 'ProductId is required' })
  productId: string;
}