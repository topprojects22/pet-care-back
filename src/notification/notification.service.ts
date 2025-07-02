import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { returnNotificationObject } from "./mapper/return-notification.mapper";

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllNotifications(userId: number) {
    const notificationList = await this.prisma.notification.findMany({
      where: {
        userId,
      },
      select: {
        ...returnNotificationObject,
        petOnNotification: { select: { pet: { select: { name: true } } } },
      },
    });
    if (!notificationList) {
      return [];
    }
    return notificationList;
  }
}
