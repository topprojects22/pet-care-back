import { Prisma } from '@prisma/client';

export const returnImageObject: Prisma.ImageSelect = {
  id: true,
  name: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
};
