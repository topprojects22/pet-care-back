import {
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { RequestNotificationDto } from './dto/request-notification.dto';
import { NotificationDto } from './dto/notification.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('getAll')
  // @Auth()
  async getAllNotifications(@Body() petDto: RequestNotificationDto) {
    return this.notificationService.getAllNotifications(petDto.userId);
  }
}
