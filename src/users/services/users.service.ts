import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { UpdateUserDto } from '../dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/utils/schema/user.schema';
import { AuthResponse, FindAllUsersResponse } from 'src/utils/types';
import { AuthService } from './auth.services';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>, private readonly authService: AuthService) { }

  async getUsers(): Promise<FindAllUsersResponse> {
    const users = await this.userModel.find().select('-password');
    return { count: users.length, users: users };
  }

  async getUser(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId).select('-password')
    if (!user) {
      throw new NotFoundException('User not found')
    }
    return user;
  }

  async createUser(data: CreateUserDto): Promise<AuthResponse> {
    let user = await this.authService.findByEmail(data.email);
    if (user) {
      throw new BadRequestException('This email already exist')
    }
    const hashedPassword = bcrypt.hashSync(data.password, 10);
    user = await this.userModel.create({ ...data, password: hashedPassword });
    return this.authService.generateResponse({ email: user.email, role: user.role }, user);
  }

  async updateUser(userId: string, data: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(userId, data, { new: true }).select('-password');
    if (!user) {
      throw new NotFoundException('User not found')
    }
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.userModel.findByIdAndDelete(userId);
    if (!user) {
      throw new NotFoundException('User not found')
    }
  }
}
