import { Prisma } from '@prisma/client';

export const returnNotificationObject: Prisma.NotificationSelect = {
  name: true,
  id: true,
  description: true,
  createdAt: true,
  expiriedAt: true,
  type: true,
};
