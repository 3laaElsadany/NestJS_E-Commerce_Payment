
import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { SignInDto } from 'src/users/dto/sign-in.dto';
import { SignUpDto } from 'src/users/dto/sign-up.dto';
import { AuthService } from 'src/users/services/auth.services';
import { AuthResponse } from 'src/utils/types';



@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('sign-up')
  async signup(@Body() data: SignUpDto): Promise<AuthResponse> {
    return await this.authService.signup(data)
  }

  @Post('sign-in')
  async signin(@Body() data: SignInDto): Promise<AuthResponse> {
    return await this.authService.signin(data)
  }
}




