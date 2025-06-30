import * as dotenv from 'dotenv';
import { PrismaClient, User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { randomNumber } from '../src/utils/random-number';
import { hash } from 'argon2';

dotenv.config();
const prisma = new PrismaClient();

const createUsers = async (quantity: number) => {
  const users: User[] = [];

  for (let item = 0; item < quantity; item++) {
    const userName = faker.person.firstName();
    const userEmail = userName + item + '@yandex.ru';
    const gameName = faker.finance.accountName();

    const user = await prisma.user.create({
      data: {
        name: userName,
        email: userEmail,
        password: await hash('Qwerty123@'),
      },
    });
    users.push(user);
  }

  console.log(`Created ${users.length} users`);
};

const createRoles = async (quantity: number) => {
  let role = await prisma.role.create({
    data: {
      name: 'admin',
    },
  });
  role = await prisma.role.create({
    data: {
      name: 'user',
    },
  });
  role = await prisma.role.create({
    data: {
      name: 'manager',
    },
  });
};

const main = async () => {
  console.log('Start seeding...');
  await createUsers(3);
  // await createRoles(10);
};

main()
  .catch((error) => console.error(error))
  .finally(async () => {
    await prisma.$disconnect();
  });
