import { IsString, IsOptional, IsNumber, IsBoolean, Min, IsNotEmpty } from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0)
  price: number;

  @IsOptional()
  @IsString({ message: 'Image must be a string' })
  image?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Stock must be a number' })
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsBoolean({ message: 'IsActive must be a boolean' })
  isActive?: boolean;
}
