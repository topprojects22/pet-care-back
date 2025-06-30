import * as dotenv from "dotenv";
import { PrismaClient, User } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { randomNumber } from "../src/utils/random-number";
import { hash } from "argon2";

dotenv.config();
const prisma = new PrismaClient();

const createUsers = async (quantity: number) => {
  const users: User[] = [];

  for (let item = 0; item < quantity; item++) {
    const userName = faker.person.firstName();
    const userEmail = userName + item + "@yandex.ru";
    const gameName = faker.finance.accountName();

    const user = await prisma.user.create({
      data: {
        name: userName,
        email: userEmail,
        password: await hash("Qwerty123@"),
      },
    });

    for (
      let petitem = 0;
      petitem < Math.floor(Math.random() * 3) + 1;
      petitem++
    ) {
      let pet = await createPet(user.id);
      let clinicId = 0;
      await prisma.clinic.findMany().then((data) => {
        clinicId = data[Math.floor(Math.random() * data.length)].id;
      });

      createAdmissionVetClinic(
        Math.floor(Math.random() * 3) + 1,
        clinicId,
        pet.id
      );
    }

    users.push(user);
  }

  console.log(`Created ${users.length} users`);
};

const createRoles = async (quantity: number) => {
  let role = await prisma.role.create({
    data: {
      name: "admin",
    },
  });
  role = await prisma.role.create({
    data: {
      name: "user",
    },
  });
  role = await prisma.role.create({
    data: {
      name: "manager",
    },
  });
};

const main = async () => {
  const tables = [
    "AdmissionVetClinic",
    "PetCard",
    "PetPassport",
    "Pet",
    "Service",
    "Clinic",
    "AnimalBreed",
    "AnimalType",
    "User",
    "Role",
  ];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`);
  }

  console.log("Start seeding...");
  await createClinic(3);
  await createAnimalType(3);
  await createUsers(3);
  // await createRoles(10);
};

main()
  .catch((error) => console.error(error))
  .finally(async () => {
    await prisma.$disconnect();
  });

const createPet = async (userId: number) => {
  const animalType =await prisma.animalType.findMany();
  const pet = await prisma.pet.create({
    data: {
      name: faker.animal.cat(),
      user: {
        connect: {
          id: userId,
        },
      },
      animalType: {
        connect: {
          id: animalType[Math.floor(Math.random() * animalType.length)].id,
        },
      },
    },
  });
  createPetPassport(pet.id);
  createPetCard(pet.id);
  return pet;
};

const createPetPassport = async (petId: number) => {
  const petPassport = await prisma.petPassport.create({
    data: {
      pet: {
        connect: {
          id: petId,
        },
      },
      chip: randomNumber(100000, 999999),
    },
  });
};

const createPetCard = async (petId: number) => {
  const petCard = await prisma.petCard.create({
    data: {
      pet: {
        connect: {
          id: petId,
        },
      },
      status: faker.animal.bear(),
      health: faker.animal.bear(),
      vaccine: faker.animal.bear(),
      totalSpent: randomNumber(100, 1000),
    },
  });
};

const createAnimalType = async (quantity: number) => {
  for (let item = 0; item < quantity; item++) {
    let animalType = await prisma.animalType.create({
      data: {
        name: faker.animal.bear(),
      },
    });
    createAnimalBreed(3, animalType.id);
  }
};

const createAnimalBreed = async (quantity: number, animalTypeId: number) => {
  for (let item = 0; item < quantity; item++) {
    await prisma.animalBreed.create({
      data: {
        name: faker.animal.bear(),
        animalType: {
          connect: {
            id: animalTypeId,
          },
        },
      },
    });
  }
};

const createClinic = async (quantity: number) => {
  for (let item = 0; item < quantity; item++) {
    let clinic = await prisma.clinic.create({
      data: {
        name: faker.company.name(),
      },
    });
    createService(3, clinic.id);
  }
};

const createService = async (quantity: number, clinicId: number) => {
  for (let item = 0; item < quantity; item++) {
    await prisma.service.create({
      data: {
        name: faker.company.name(),
        description: faker.company.catchPhrase(),
        recomendation: faker.lorem.sentence(),
        price: randomNumber(100, 1000),
        clinic: {
          connect: {
            id: clinicId,
          },
        },
      },
    });
  }
};

const createAdmissionVetClinic = async (
  quantity: number,
  clinicId: number,
  petId: number
) => {
  for (let item = 0; item < quantity; item++) {
    await prisma.admissionVetClinic.create({
      data: {
        description: faker.company.catchPhrase(),
        recomendation: faker.lorem.sentence(),
        procedure: faker.lorem.sentence(),
        diagnosis: faker.lorem.sentence(),
        clinic: {
          connect: {
            id: clinicId,
          },
        },
        pet: {
          connect: {
            id: petId,
          },
        },
      },
    });
  }
};
