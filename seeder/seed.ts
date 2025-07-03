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
      let petItem = 0;
      petItem < Math.floor(Math.random() * 3) + 1;
      petItem++
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

    const petList = await prisma.pet.findMany({ where: { userId: user.id } });

    createNotification(
      Math.floor(Math.random() * 3) + 1,
      petList[Math.floor(Math.random() * petList.length)].id,
      user.id
    );

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
    "Notification",
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
  const animalType = await prisma.animalType.findMany();
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

      // Паспорт питомца
      await prisma.petPassport.create({
        data: {
          petId: pet.id,
          chip: faker.number.int({ min: 100000, max: 999999 }),
          chipInstallDate: faker.date.past(),
          breedId: faker.helpers.arrayElement(breeds).id,
          tattooNumber: faker.datatype.boolean() ? faker.string.numeric(6) : null,
          specialMarks: faker.datatype.boolean() ? faker.lorem.sentence() : null,
          issuingOrganization: faker.company.name(),
          registrationNumber: `REG-${faker.string.alphanumeric(6)}`,
          vaccinationHistory: {
            lastVaccine: faker.date.recent().toISOString(),
            nextDue: faker.date.soon().toISOString()
          },
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${pet.id}`
        },
      });

      // Карта питомца
      await prisma.petCard.create({
        data: {
          petId: pet.id,
          status: faker.helpers.arrayElement(['Healthy', 'Ill', 'Recovering']),
          health: faker.lorem.sentence(),
          vaccine: faker.lorem.words(3),
          totalSpent: faker.number.int({ min: 1000, max: 10000 }),
          lastVetVisit: faker.date.past(),
          nextVetVisit: faker.date.future(),
          allergies: faker.datatype.boolean() ? faker.lorem.words(3) : null,
          chronicDiseases: faker.datatype.boolean() ? faker.lorem.words(2) : null,
          favoriteFood: faker.lorem.words(2),
          bloodType: faker.helpers.arrayElement(['A', 'B', 'AB', 'O']),
          dentalRecords: faker.lorem.sentence(),
          parasiteControl: faker.date.recent().toISOString(),
        },
      });

      // Фото питомца
      await prisma.petPhoto.createMany({
        data: Array.from({ length: 3 }).map((_, i) => ({
          petId: pet.id,
          url: faker.image.urlLoremFlickr({ category: 'animals' }),
          isPrimary: i === 0,
        })),
      });

      // Медикаменты
      await prisma.medication.createMany({
        data: Array.from({ length: 2 }).map(() => ({
          petId: pet.id,
          name: faker.helpers.arrayElement(['Antibiotic', 'Painkiller', 'Vitamins']),
          dosage: `${faker.number.int({ min: 1, max: 5 })}mg`,
          frequency: faker.helpers.arrayElement(['once daily', 'twice daily']),
          startDate: faker.date.recent(),
          endDate: faker.date.future(),
          description: faker.lorem.sentence(),
        })),
      });

      // Вакцинации
      await prisma.vaccination.createMany({
        data: Array.from({ length: 2 }).map(() => ({
          petId: pet.id,
          name: faker.helpers.arrayElement(['Rabies', 'Distemper', 'Parvovirus']),
          date: faker.date.past(),
          nextDate: faker.date.future(),
          clinicId: faker.helpers.arrayElement(clinics).id,
          description: faker.lorem.sentence(),
          files: Array.from({ length: 2 }, () => faker.internet.url()),
        })),
      });

      // Метрики здоровья
      await prisma.healthMetric.createMany({
        data: Array.from({ length: 5 }).map(() => ({
          petId: pet.id,
          metricType: faker.helpers.arrayElement(['Weight', 'Temperature', 'Pulse']),
          value: faker.number.float({ min: 1, max: 50, precision: 0.1 }),
          notes: faker.datatype.boolean() ? faker.lorem.sentence() : null,
        })),
      });

      // Записи о груминге
      await prisma.groomingRecord.createMany({
        data: Array.from({ length: 2 }).map(() => ({
          petId: pet.id,
          serviceType: faker.helpers.arrayElement(['Bath', 'Haircut', 'Nail Trim']),
          status: faker.helpers.arrayElement(['Active', 'Completed', 'Cancelled']),
          date: faker.date.past(),
          nextDate: faker.date.future(),
          groomerName: faker.person.fullName(),
          notes: faker.lorem.sentence(),
          cost: faker.number.float({ min: 20, max: 200 }),
        })),
      });

      // Записи о посещении клиники
      const clinic = faker.helpers.arrayElement(clinics);
      await prisma.admissionVetClinic.createMany({
        data: Array.from({ length: 2 }).map(() => ({
          petId: pet.id,
          clinicId: clinic.id,
          procedure: faker.helpers.arrayElement(['Checkup', 'Vaccination', 'Surgery']),
          description: faker.lorem.paragraph(),
          diagnosis: faker.lorem.words(3),
          recomendation: faker.lorem.sentence(),
          visitDate: faker.date.past(),
          nextVisitDate: faker.date.future(),
          doctorName: faker.person.fullName(),
          medications: faker.lorem.words(5),
          cost: faker.number.float({ min: 500, max: 5000 }),
          files: Array.from({ length: 2 }, () => faker.internet.url()),
          temperature: faker.number.float({ min: 37, max: 40, precision: 0.1 }),
          pulse: faker.number.int({ min: 60, max: 120 }),
          respiration: faker.number.int({ min: 10, max: 30 }),
          weight: faker.number.float({ min: 1, max: 50, precision: 0.1 }),
          status: faker.helpers.arrayElement(['SCHEDULED', 'COMPLETED']),
        })),
      });

      // Уведомления
      await prisma.notification.create({
        data: {
          name: faker.helpers.arrayElement(['Vaccination due', 'Vet appointment']),
          description: faker.lorem.sentence(),
          type: faker.helpers.arrayElement(Object.values(NotificationType)),
          userId: user.id,
          isCompleted: faker.datatype.boolean(),
          location: faker.company.name(),
          repeatPattern: faker.helpers.arrayElement(['daily', 'weekly', 'monthly']),
          petOnNotification: {
            create: {
              petId: pet.id,
              assignedBy: 'System',
            },
          },
        },
      });

      // Платежи
      const service = faker.helpers.arrayElement(services);
      await prisma.payment.create({
        data: {
          userId: user.id,
          serviceId: service.id,
          amount: service.price,
          method: faker.helpers.arrayElement(['cash', 'card', 'online']),
          invoiceNumber: `INV-${faker.string.numeric(6)}`,
        },
      });

      // Отзывы
      await prisma.review.create({
        data: {
          userId: user.id,
          clinicId: clinic.id,
          rating: faker.number.int({ min: 1, max: 5 }),
          comment: faker.datatype.boolean() ? faker.lorem.sentences(2) : null,
        },
      });
    }
  }

  await createPetBoardings();

  console.log('Seeding completed successfully!');
}

main()
  .catch(e => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

async function createPetBoardings() {
  const users = await prisma.user.findMany();
  const pets = await prisma.pet.findMany();

  const boardings = await Promise.all(
    Array.from({ length: 5 }).map((_, i) => 
      prisma.petBoarding.create({
        data: {
          name: `Pet Paradise ${i + 1}`,
          description: faker.lorem.paragraph(),
          address: faker.location.streetAddress(),
          phone: faker.phone.number(),
          email: faker.internet.email(),
          website: faker.internet.url(),
          geoCoordinates: `${faker.location.latitude()}, ${faker.location.longitude()}`,
          photos: Array.from({ length: 5 }, () => faker.image.urlLoremFlickr({ category: 'animal' })),
          pricePerDay: faker.number.float({ min: 15, max: 50, precision: 0.01 }),
          capacity: faker.number.int({ min: 5, max: 20 }),
          availableSpots: faker.number.int({ min: 1, max: 5 }),
          amenities: ['Outdoor play area', '24/7 Supervision', 'Daily walks', 'Grooming'],
          rules: ['Vaccination required', 'Must be flea-free', 'No aggressive pets'],
          checkInTime: '08:00',
          checkOutTime: '18:00',
          userId: faker.helpers.arrayElement(users).id,
        },
      })
    )
  );

  // Добавляем сотрудников для каждой гостиницы
  for (const boarding of boardings) {
    await prisma.petBoardingStaff.createMany({
      data: Array.from({ length: 3 }).map(() => ({
        boardingId: boarding.id,
        name: faker.person.fullName(),
        position: faker.person.jobTitle(),
        phone: faker.phone.number(),
        email: faker.internet.email(),
      })),
    });
  }

  // Создаем бронирования
  for (const user of users.slice(0, 3)) {
    const pet = faker.helpers.arrayElement(pets.filter(p => p.userId === user.id));
    if (!pet) continue;

    const startDate = faker.date.soon({ days: 5 });
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + faker.number.int({ min: 1, max: 7 }));

    const boarding = faker.helpers.arrayElement(boardings);
    const pricePerDay = boarding.pricePerDay;
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = pricePerDay * days;

    const booking = await prisma.petBoardingBooking.create({
      data: {
        name: faker.company.name(),
        description: faker.company.catchPhrase(),
        type: "hight",
        petOnNotification: {
          create: [
            {
              pet: {
                connect: {
                  id: petId,
                },
              },
              assignedBy: "System",
            },
          ],
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }
};
