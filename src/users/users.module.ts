import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { UsersGuard } from '../utils/guards/users.guard';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/auth.services';
import { AuthController } from './controllers/auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/utils/schema/user.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';


@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('EXPIRE_TIME') },
      }),
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ],
  controllers: [
    UsersController,
    AuthController
  ],
  providers: [
    UsersService,
    UsersGuard,
    AuthService
  ],
  exports: [JwtModule, AuthService]
})
export class UsersModule { }
