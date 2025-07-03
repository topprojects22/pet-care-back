import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto, UpdateNotificationDto } from './dto/notification.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationsService: NotificationService) {}

  @Get('user/:userId')
  @Auth()
  async getUserNotifications(@Param('userId') userId: string) {
    return this.notificationsService.getUserNotifications(+userId);
  }

  @Get('pet/:petId')
  @Auth()
  async getPetNotifications(@Param('petId') petId: string) {
    return this.notificationsService.getPetNotifications(+petId);
  }

  @Get('calendar/:userId')
  @Auth()
  async getCalendarEvents(
    @Param('userId') userId: string,
    @Query('start') startDate: string,
    @Query('end') endDate: string,
  ) {
    return this.notificationsService.getCalendarEvents(+userId, startDate, endDate);
  }

  @Post()
  @Auth()
  async createNotification(@Body() notificationData: CreateNotificationDto) {
    return this.notificationsService.createNotification(notificationData);
  }

  @Put(':id')
  @Auth()
  async updateNotification(
    @Param('id') id: string,
    @Body() notificationData: UpdateNotificationDto,
  ) {
    return this.notificationsService.updateNotification(+id, notificationData);
  }

  @Delete(':id')
  @Auth()
  async deleteNotification(@Param('id') id: string) {
    return this.notificationsService.deleteNotification(+id);
  }

  @Put(':id/complete')
  @Auth()
  async markAsCompleted(@Param('id') id: string) {
    return this.notificationsService.markAsCompleted(+id);
  }
}