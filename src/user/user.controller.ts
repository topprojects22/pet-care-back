import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { UpdateProfileDto } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private usersService: UserService) {}

  @Get()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('profile')
  @Auth()
  getUserProfile(@CurrentUser('id') id: number) {
    return this.usersService.getUserProfile(id);
  }
  @UsePipes(new ValidationPipe())
  @Put('profile')
  @Auth()
  updateProfile(
    @CurrentUser('id') id: number,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(id, updateProfileDto);
  }
}
