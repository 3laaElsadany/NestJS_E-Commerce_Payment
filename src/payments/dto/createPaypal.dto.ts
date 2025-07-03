import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsString } from "class-validator";
import { CreateStripeDto } from "./createStripe.dto";

export class CreatePaypalDto extends PartialType(CreateStripeDto) {
  @IsString({ message: 'Line1 must be string' })
  @IsNotEmpty({ message: 'Line1 is required' })
  line1: string;

  @IsString({ message: 'Line2 must be string' })
  @IsNotEmpty({ message: 'Line2 is required' })
  line2: string;

  @IsString({ message: 'City must be string' })
  @IsNotEmpty({ message: 'City is required' })
  city: string;

  @IsString({ message: 'State must be string' })
  @IsNotEmpty({ message: 'State is required' })
  state: string;

  @IsString({ message: 'Postal_code must be string' })
  @IsNotEmpty({ message: 'Postal_code is required' })
  postal_code: string;
}