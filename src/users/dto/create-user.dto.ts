import { IsEnum } from 'class-validator';
import { SignUpDto } from './sign-up.dto';
import { UserRole } from 'src/utils/types';

export class CreateUserDto extends SignUpDto {
  @IsEnum([UserRole.ADMIN, UserRole.MANGER, UserRole.USER], { message: 'Invalid user role' })
  role: string
}