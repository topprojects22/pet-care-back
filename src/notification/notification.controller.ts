// src/notification/notification.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { GetNotificationsQueryDto } from './dto/get-notifications-query.dto';
import { Auth } from "../auth/decorators/auth.decorator";
import { CurrentUser } from '../common/decorators/user.decorator';
import { User } from '@prisma/client';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @Auth()
  create(@Body() dto: CreateNotificationDto, @CurrentUser() user: User) {
    return this.notificationService.createNotification(user.id, dto);
  }

  @Get()
  @Auth()
  findAll(
      @CurrentUser() user: User,
      @Query() query: GetNotificationsQueryDto,
  ) {
    return this.notificationService.findAllForUser(user.id, {
      isCompleted: query.completed,
      type: query.type,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get(':id')
  @Auth()
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(+id);
  }

  @Patch(':id/complete')
  @Auth()
  complete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notificationService.markAsCompleted(user.id, +id);
  }

  @Patch(':id/confirm')
  @Auth()
  confirm(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notificationService.confirmNotification(user.id, +id);
  }
}