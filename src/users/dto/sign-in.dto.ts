import { IsString, IsEmail, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class SignInDto {

  @IsString({ message: 'Email must be string' })
  @IsEmail({}, { message: 'Email not valid' })
  @IsNotEmpty({ message: "Email is required" })
  email: string;

  @IsString({ message: 'password must be string' })
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(6, { message: 'password must be at least 6 characters' })
  @MaxLength(20, { message: 'password must be less than 20 characters' })
  password: string;
}
