import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { SignInDto } from 'src/users/dto/sign-in.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/utils/schema/user.schema';
import { SignUpDto } from 'src/users/dto/sign-up.dto';
import { AuthResponse, AuthUser } from 'src/utils/types';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<User>, private jwtService: JwtService) { }

  async signin(data: SignInDto): Promise<AuthResponse> {
    const { email, password } = data;
    const user = await this.findByEmail(data.email);

    if (!user || !await bcrypt.compareSync(password, user.password)) {
      throw new NotFoundException('Incorrect email or password')
    }

    return this.generateResponse({ email: user.email, role: user.role }, user);
  }

  async signup(data: SignUpDto): Promise<AuthResponse> {
    let user = await this.findByEmail(data.email)

    if (user) {
      throw new BadRequestException("This email already exists")
    }

    const hashedPassword = bcrypt.hashSync(data.password, 10);
    user = await this.userModel.create({
      ...data,
      password: hashedPassword
    });

    return this.generateResponse({ email: user.email, role: user.role }, user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({
      email
    });
  }

  async generateResponse(data: AuthUser, user): Promise<AuthResponse> {
    const payload = { email: data.email, role: data.role, userId: user._id };

    const token = await this.jwtService.sign(payload);

    return { user, token };
  }
}