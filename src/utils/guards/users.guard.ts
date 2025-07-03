import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Roles } from '../decorator/Roles.decorator';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class UsersGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService
  ) { }
  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get(Roles, context.getHandler());

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = (request.headers.authorization || '   ').split(' ', 2)[1];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }


    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }
    if (roles.includes(payload.role.toLowerCase())) {
      return true;
    } else {
      throw new UnauthorizedException('You do not have permission to access this resource');
    }

  }
}