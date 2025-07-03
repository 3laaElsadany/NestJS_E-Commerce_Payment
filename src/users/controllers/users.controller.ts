import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Roles } from '../../utils/decorator/Roles.decorator';
import { UsersGuard } from 'src/utils/guards/users.guard';
import { AuthResponse, FindAllUsersResponse } from 'src/utils/types';
import { User } from 'src/utils/schema/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';



@UseGuards(UsersGuard)
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }


  @Roles(['admin', 'manager'])
  @Get()
  async getUsers(): Promise<FindAllUsersResponse> {
    return await this.usersService.getUsers()
  }

  @Roles(['admin'])
  @Post()
  async createUser(@Body() data: CreateUserDto): Promise<AuthResponse> {
    return await this.usersService.createUser(data)
  }

  @Roles(['admin', 'manager'])
  @Get('/:userId')
  async getUser(@Param('userId') userId: string): Promise<User> {
    return await this.usersService.getUser(userId)
  }

  @Roles(['admin', 'manager'])
  @Patch('/:userId')
  async updateUser(@Param('userId') userId: string, @Body() data: UpdateUserDto): Promise<User> {
    return await this.usersService.updateUser(userId, data)
  }

  @Roles(['admin'])
  @Delete('/:userId')
  deleteUser(@Param('userId') userId: string): Promise<void> {
    return this.usersService.deleteUser(userId)
  }
}
