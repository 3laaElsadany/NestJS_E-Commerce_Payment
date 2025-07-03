import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { SignInDto } from "./sign-in.dto";

export class SignUpDto extends SignInDto {

  @IsString()
  @MinLength(3, {
    message: 'firstName must be at least 3 character'
  })
  @IsNotEmpty({ message: 'FirstName is required' })
  firstName: string;

  @IsString()
  @MaxLength(20, {
    message: 'lastName value is too big'
  })
  @IsNotEmpty({ message: 'LastName is required' })
  lastName: string;
}