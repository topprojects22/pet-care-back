import { PrismaClient, PetGender, BreedSize, NotificationType, BookingStatus, PaymentMethod } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { hash } from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Очистка базы данных
  const tables = [
    'PetOnNotification',
    'HealthMetric',
    'GroomingRecord',
    'Payment',
    'Review',
    'StaffMember',
    'PetPhoto',
    'Vaccination',
    'Medication',
    'AdmissionVetClinic',
    'PetCard',
    'PetPassport',
    'Pet',
    'Service',
    'Clinic',
    'AnimalBreed',
    'AnimalType',
    'Notification',
    'User',
    'Role',
    'PetBoarding',
    'PetBoardingBooking',
    'PetBoardingPayment',
    'PetBoardingReview',
    'PetBoardingStaff',
  ];

  await prisma.$executeRaw`SET session_replication_role = 'replica';`;
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }
  await prisma.$executeRaw`SET session_replication_role = 'origin';`;

  // Создание ролей
  await prisma.role.createMany({
    data: [
      { name: 'admin' },
      { name: 'user' },
      { name: 'manager' },
    ],
  });

  // Создание типов животных
  const animalTypes = await Promise.all(
    ['Cat', 'Dog', 'Bird'].map(name =>
      prisma.animalType.create({
        data: {
          name,
          icon: faker.internet.emoji(),
          description: faker.lorem.sentence(),
        },
      })
    )
  );

  // Создание пород для каждого типа
  const breedNames = {
    Cat: ['Siamese', 'Persian', 'Bengal'],
    Dog: ['Labrador', 'Bulldog', 'Beagle'],
    Bird: ['Parrot', 'Canary', 'Cockatiel']
  };

  for (const type of animalTypes) {
    await prisma.animalBreed.createMany({
      data: breedNames[type.name as keyof typeof breedNames].map(name => ({
        name,
        animalTypeId: type.id,
        description: faker.lorem.sentence(),
        sizeCategory: faker.helpers.arrayElement(Object.values(BreedSize)),
        lifeExpectancy: faker.number.int({ min: 5, max: 20 }),
      })),
    });
  }

  const breeds = await prisma.animalBreed.findMany();

  // Создание клиник
  const clinics = await Promise.all(
    Array.from({ length: 3 }).map(() =>
      prisma.clinic.create({
        data: {
          name: faker.company.name(),
          address: faker.location.streetAddress(),
          phone: faker.phone.number(),
          email: faker.internet.email(),
          website: faker.internet.url(),
          workingHours: `${faker.number.int({ min: 8, max: 10 })}:00 - ${faker.number.int({ min: 18, max: 22 })}:00`,
          geoCoordinates: `${faker.location.latitude()}, ${faker.location.longitude()}`,
          rating: faker.number.float({ min: 1, max: 5, precision: 0.1 }),
          photos: Array.from({ length: 3 }, () => faker.image.urlLoremFlickr({ category: 'clinic' })),
          licenseNumber: faker.string.alphanumeric(10),
          foundingDate: faker.date.past({ years: 10 }),
          specialties: [faker.word.noun(), faker.word.noun()],
          equipment: [faker.word.noun(), faker.word.noun()],
          parkingAvailable: faker.datatype.boolean(),
          emergencyService: faker.datatype.boolean(),
        },
      })
    )
  );

  // Создание сотрудников для клиник
  for (const clinic of clinics) {
    await prisma.staffMember.createMany({
      data: Array.from({ length: 3 }).map(() => ({
        clinicId: clinic.id,
        name: faker.person.fullName(),
        position: faker.person.jobTitle(),
        specialty: faker.word.noun(),
        phone: faker.phone.number(),
        email: faker.internet.email(),
      })),
    });
  }

  // Создание услуг для клиник
  const serviceTypes = ['Vaccination', 'Examination', 'Surgery', 'Grooming'];
  for (const clinic of clinics) {
    await prisma.service.createMany({
      data: serviceTypes.map(name => ({
        name,
        clinicId: clinic.id,
        description: faker.lorem.paragraph(),
        recomendation: faker.lorem.sentence(),
        price: faker.number.int({ min: 500, max: 5000 }),
        duration: faker.number.int({ min: 15, max: 120 }),
        category: faker.helpers.arrayElement(['Medical', 'Cosmetic', 'Emergency']),
        isEmergency: faker.datatype.boolean(),
        preparation: faker.lorem.sentence(),
        recoveryTime: `${faker.number.int({ min: 1, max: 14 })} days`,
        contraindications: faker.lorem.words(3),
        successRate: faker.number.float({ min: 70, max: 100, precision: 0.1 }),
      })),
    });
  }

  const services = await prisma.service.findMany();

  // Создание пользователей
  const users = await Promise.all(
    Array.from({ length: 5 }).map(async (_, i) => {
      const firstName = faker.person.firstName();
      const email = `${firstName.toLowerCase()}${i}@example.com`;
      
      return prisma.user.create({
        data: {
          name: firstName,
          lastName: faker.person.lastName(),
          email,
          password: await hash('Qwerty123@'),
          phone: faker.phone.number(),
          avatarPath: faker.image.avatar(),
          roleId: (await prisma.role.findFirst({ where: { name: 'user' } }))?.id,
          birthDate: faker.date.past({ years: 30 }),
          address: faker.location.streetAddress(),
          emergencyContact: faker.phone.number(),
          insuranceNumber: faker.string.alphanumeric(10),
          preferences: {
            notifications: {
              email: true,
              sms: false,
              push: true
            },
            language: 'en'
          },
          socialMedia: {
            facebook: faker.internet.userName(),
            instagram: faker.internet.userName()
          },
          lastLoginAt: faker.date.recent(),
        },
      });
    })
  );

  // Добавление клиник в избранное для пользователей
  for (const user of users) {
    const randomClinics = faker.helpers.arrayElements(clinics, 2);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        preferredClinics: {
          connect: randomClinics.map(c => ({ id: c.id }))
        }
      }
    });
  }

  // Создание питомцев
  for (const user of users) {
    const petCount = faker.number.int({ min: 1, max: 3 });
    
    for (let i = 0; i < petCount; i++) {
      const pet = await prisma.pet.create({
        data: {
          name: faker.animal.cat(),
          userId: user.id,
          birthDate: faker.date.past({ years: 5 }),
          gender: faker.helpers.arrayElement(Object.values(PetGender)),
          weight: faker.number.float({ min: 1, max: 50, precision: 0.1 }),
          color: faker.color.human(),
          isSterilized: faker.datatype.boolean(),
          pedigreeNumber: faker.string.alphanumeric(8),
          insurancePolicy: `POL-${faker.string.numeric(6)}`,
          foodPreferences: faker.lorem.words(3),
          behaviorNotes: faker.lorem.sentence(),
          trainingLevel: faker.helpers.arrayElement(['Basic', 'Intermediate', 'Advanced']),
          favoriteToys: faker.lorem.words(2),
          dailyRoutine: faker.lorem.sentence(),
          animalTypeId: faker.helpers.arrayElement(animalTypes).id,
        },
      });

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
        petId: pet.id,
        boardingId: boarding.id,
        startDate,
        endDate,
        status: faker.helpers.arrayElement(Object.values(BookingStatus)),
        totalPrice,
        userId: user.id,
        specialRequests: faker.datatype.boolean() ? faker.lorem.sentence() : null,
      },
    });

    // Добавляем платежи для бронирований
    if (booking.status !== 'CANCELLED') {
      await prisma.petBoardingPayment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalPrice,
          paymentMethod: faker.helpers.arrayElement(Object.values(PaymentMethod)),
          status: booking.status === 'CONFIRMED' ? 'PAID' : 'PENDING',
          transactionId: `TXN-${faker.string.numeric(8)}`,
        },
      });
    }

    // Добавляем отзывы для завершенных бронирований
    if (booking.status === 'COMPLETED' && faker.datatype.boolean()) {
      await prisma.petBoardingReview.create({
        data: {
          bookingId: booking.id,
          userId: user.id,
          rating: faker.number.int({ min: 1, max: 5 }),
          comment: faker.datatype.boolean() ? faker.lorem.sentences(2) : null,
        },
      });
    }
  }

  return boardings;
}

