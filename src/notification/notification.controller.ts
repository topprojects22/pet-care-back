// src/notification/notification.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import {Auth} from "../auth/decorators/auth.decorator";

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @Auth()
  create(@Body() dto: CreateNotificationDto, @Req() req) {
    return this.notificationService.createNotification(req.user.id, dto);
  }

  @Get()
  @Auth()
  findAll(
      @Req() req,
      @Query('completed') completed?: string,
      @Query('page') page?: string,
      @Query('limit') limit?: string,
  ) {
    return this.notificationService.findAllForUser(
        req.user.id,
        completed === 'true',
        page ? +page : undefined,
        limit ? +limit : undefined,
    );
  }

  @Get(':id')
  @Auth()
  findOne(@Param('id') id: string, @Req() req) {
    const notification = this.notificationService.findOne(+id);
    // Проверка прав — внутри сервиса
    return notification;
  }

  @Patch(':id/complete')
  @Auth()
  complete(@Param('id') id: string, @Req() req) {
    return this.notificationService.markAsCompleted(req.user.id, +id);
  }

  @Patch(':id/confirm')
  @Auth()
  confirm(@Param('id') id: string, @Req() req) {
    return this.notificationService.confirmNotification(req.user.id, +id);
  }
}