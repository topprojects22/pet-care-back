import { Prisma } from '@prisma/client';

export const returnGameObject: Prisma.GameSelect = {
  id: true,
  name: true,
  value: true,
  size: true,
  createdAt: true,
};

export const returnGameObjectFull: Prisma.GameSelect = {
  ...returnGameObject,
};
