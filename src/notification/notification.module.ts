// src/notification/notification.module.ts
import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationSchedulerService } from './notification.scheduler.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, NotificationSchedulerService, PrismaService],
  exports: [NotificationService, NotificationSchedulerService],
})
export class NotificationModule {}