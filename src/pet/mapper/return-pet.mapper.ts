import { Prisma } from '@prisma/client';

export const returnPetObject: Prisma.PetSelect = {
  name: true,
  createdAt: true,
};
