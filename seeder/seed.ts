import { PrismaClient, PetGender, BreedSize, NotificationType, BookingStatus, PaymentMethod, PostType, ParticipationStatus, AdoptionStatus, DonationStatus, PaymentSessionStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { hash } from 'argon2';

const prisma = new PrismaClient();

// Конфигурация количества данных
interface SeedConfig {
  users: number;
  clinics: number;
  petsPerUser: { min: number; max: number };
  servicesPerClinic: number;
  staffPerClinic: number;
  boardings: number;
}

const DEFAULT_CONFIG: SeedConfig = {
  users: 10,
  clinics: 5,
  petsPerUser: { min: 1, max: 3 },
  servicesPerClinic: 4,
  staffPerClinic: 3,
  boardings: 5,
};

// Утилиты для логирования
const log = {
  info: (message: string) => console.log(`\x1b[36m[INFO]\x1b[0m ${message}`),
  success: (message: string) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${message}`),
  error: (message: string) => console.error(`\x1b[31m[ERROR]\x1b[0m ${message}`),
  warn: (message: string) => console.warn(`\x1b[33m[WARN]\x1b[0m ${message}`),
  step: (step: number, total: number, message: string) =>
    console.log(`\x1b[35m[${step}/${total}]\x1b[0m ${message}`),
};

// Таймер для измерения времени
class Timer {
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  elapsed(): number {
    return Date.now() - this.startTime;
  }

  format(): string {
    const elapsed = this.elapsed();
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
  }
}

async function main() {
  const timer = new Timer();
  const config = getConfig();
  
  log.info('🌱 Начало заполнения базы данных...');
  log.info(`Конфигурация: ${JSON.stringify(config, null, 2)}`);
  console.log('');

  try {
    // Шаг 1: Очистка базы данных
    await step1_cleanDatabase();

    // Шаг 2: Создание базовых данных
    const { roles, animalTypes, breeds } = await step2_createBaseData();

    // Шаг 3: Создание клиник и услуг
    const { clinics, services } = await step3_createClinics(config);

    // Шаг 4: Создание пользователей
    const users = await step4_createUsers(config, roles);

    // Шаг 5: Создание питомцев и связанных данных
    await step5_createPets(config, users, animalTypes, breeds, clinics, services);

    // Шаг 6: Создание гостиниц для животных
    await step6_createBoardings(config, users);

    // Шаг 7: Создание приютов и животных
    const { shelters, shelterAnimals } = await step7_createShelters(config, users, animalTypes, breeds);

    // Шаг 8: Создание социальных постов и взаимодействий
    await step8_createSocialContent(config, users, shelters);

    // Шаг 9: Создание запросов на усыновление и пожертвований
    await step9_createAdoptionAndDonations(config, users, shelters, shelterAnimals);

    // Шаг 10: Создание платежных сессий и дневников питомцев
    await step10_createPaymentSessionsAndJournals(config, users, services);

    log.success(`✅ Заполнение базы данных завершено успешно за ${timer.format()}!`);
    await printStatistics();
  } catch (error) {
    log.error(`Ошибка при заполнении базы данных: ${error}`);
    throw error;
  }
}

function getConfig(): SeedConfig {
  // Можно читать из переменных окружения или аргументов командной строки
  const envConfig = {
    users: parseInt(process.env.SEED_USERS || '0'),
    clinics: parseInt(process.env.SEED_CLINICS || '0'),
    boardings: parseInt(process.env.SEED_BOARDINGS || '0'),
  };

  return {
    users: envConfig.users || DEFAULT_CONFIG.users,
    clinics: envConfig.clinics || DEFAULT_CONFIG.clinics,
    petsPerUser: DEFAULT_CONFIG.petsPerUser,
    servicesPerClinic: DEFAULT_CONFIG.servicesPerClinic,
    staffPerClinic: DEFAULT_CONFIG.staffPerClinic,
    boardings: envConfig.boardings || DEFAULT_CONFIG.boardings,
  };
}

async function step1_cleanDatabase() {
  log.step(1, 10, 'Очистка базы данных...');
  
  const tables = [
    'PetOnNotification',
    'HealthMetric',
    'GroomingRecord',
    'Payment',
    'PaymentSession',
    'Review',
    'StaffMember',
    'PetPhoto',
    'Vaccination',
    'Medication',
    'AdmissionVetClinic',
    'PetCard',
    'PetPassport',
    'Pet',
    'PetJournalEntry',
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
    'CommunityPost',
    'PostComment',
    'PostLike',
    'EventParticipation',
    'Shelter',
    'ShelterAnimal',
    'AdoptionRequest',
    'Donation',
    'EmailVerification',
    'PasswordReset',
  ];

  try {
    await prisma.$executeRaw`SET session_replication_role = 'replica';`;
    for (const table of tables) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    }
    await prisma.$executeRaw`SET session_replication_role = 'origin';`;
    log.success(`Очищено ${tables.length} таблиц`);
  } catch (error) {
    log.warn(`Ошибка при очистке таблиц: ${error}`);
    // Продолжаем выполнение, так как таблицы могут не существовать
  }
}

async function step2_createBaseData() {
  log.step(2, 10, 'Создание базовых данных (роли, типы животных, породы)...');

  // Создание ролей
  await prisma.role.createMany({
    data: [
      { name: 'admin' },
      { name: 'user' },
      { name: 'manager' },
      { name: 'vet' },
    ],
    skipDuplicates: true,
  });

  const roleRecords = await prisma.role.findMany();

  // Создание типов животных
  const animalTypeData = [
    { name: 'Cat', icon: '🐱', description: 'Кошки' },
    { name: 'Dog', icon: '🐶', description: 'Собаки' },
    { name: 'Bird', icon: '🐦', description: 'Птицы' },
    { name: 'Rabbit', icon: '🐰', description: 'Кролики' },
    { name: 'Hamster', icon: '🐹', description: 'Хомяки' },
  ];

  const animalTypes = await Promise.all(
    animalTypeData.map(data =>
      prisma.animalType.create({
        data,
      })
    )
  );

  // Создание пород
  const breedData = {
    Cat: ['Siamese', 'Persian', 'Bengal', 'Maine Coon', 'British Shorthair'],
    Dog: ['Labrador', 'Bulldog', 'Beagle', 'German Shepherd', 'Golden Retriever'],
    Bird: ['Parrot', 'Canary', 'Cockatiel', 'Budgerigar', 'Finch'],
    Rabbit: ['Angora', 'Rex', 'Lop', 'Dutch', 'Lionhead'],
    Hamster: ['Syrian', 'Dwarf', 'Roborovski', 'Chinese', 'European'],
  };

  for (const type of animalTypes) {
    const breedNames = breedData[type.name as keyof typeof breedData] || [];
    await prisma.animalBreed.createMany({
      data: breedNames.map(name => ({
        name,
        animalTypeId: type.id,
        description: faker.lorem.sentence(),
        sizeCategory: faker.helpers.arrayElement(Object.values(BreedSize)),
        lifeExpectancy: faker.number.int({ min: 5, max: 20 }),
      })),
      skipDuplicates: true,
    });
  }

  const breeds = await prisma.animalBreed.findMany();
  log.success(`Создано: ${roleRecords.length} ролей, ${animalTypes.length} типов животных, ${breeds.length} пород`);

  return { roles: roleRecords, animalTypes, breeds };
}

async function step3_createClinics(config: SeedConfig) {
  log.step(3, 10, `Создание клиник (${config.clinics} шт.) и услуг...`);

  const clinics = await Promise.all(
    Array.from({ length: config.clinics }).map((_, i) =>
      prisma.clinic.create({
        data: {
          name: `${faker.company.name()} Veterinary Clinic`,
          address: faker.location.streetAddress(),
          phone: faker.phone.number(),
          email: faker.internet.email(),
          website: faker.internet.url(),
          workingHours: `${faker.number.int({ min: 8, max: 10 })}:00 - ${faker.number.int({ min: 18, max: 22 })}:00`,
          geoCoordinates: `${faker.location.latitude()}, ${faker.location.longitude()}`,
          rating: faker.number.float({ min: 3.5, max: 5, precision: 0.1 }),
          photos: Array.from({ length: 3 }, () => faker.image.urlLoremFlickr({ category: 'clinic' })),
          licenseNumber: `LIC-${faker.string.alphanumeric(8).toUpperCase()}`,
          foundingDate: faker.date.past({ years: 10 }),
          specialties: faker.helpers.arrayElements(
            ['Surgery', 'Dentistry', 'Cardiology', 'Dermatology', 'Oncology'],
            { min: 2, max: 4 }
          ),
          equipment: faker.helpers.arrayElements(
            ['X-Ray', 'Ultrasound', 'Laboratory', 'Surgery Room'],
            { min: 2, max: 4 }
          ),
          parkingAvailable: faker.datatype.boolean(),
          emergencyService: faker.datatype.boolean(),
        },
      })
    )
  );

  // Создание сотрудников для клиник
  for (const clinic of clinics) {
    await prisma.staffMember.createMany({
      data: Array.from({ length: config.staffPerClinic }).map(() => ({
        clinicId: clinic.id,
        name: faker.person.fullName(),
        position: faker.helpers.arrayElement(['Veterinarian', 'Nurse', 'Receptionist', 'Surgeon']),
        specialty: faker.helpers.arrayElement(['General', 'Surgery', 'Dentistry', 'Cardiology']),
        phone: faker.phone.number(),
        email: faker.internet.email(),
      })),
    });
  }

  // Создание услуг
  const serviceTypes = [
    { name: 'Vaccination', category: 'Medical', price: { min: 500, max: 2000 } },
    { name: 'Examination', category: 'Medical', price: { min: 1000, max: 3000 } },
    { name: 'Surgery', category: 'Medical', price: { min: 5000, max: 20000 } },
    { name: 'Grooming', category: 'Cosmetic', price: { min: 500, max: 2000 } },
    { name: 'Dental Cleaning', category: 'Medical', price: { min: 2000, max: 5000 } },
    { name: 'X-Ray', category: 'Diagnostic', price: { min: 1500, max: 4000 } },
  ];

  const services = [];
  for (const clinic of clinics) {
    const clinicServices = await Promise.all(
      serviceTypes.slice(0, config.servicesPerClinic).map(serviceType =>
        prisma.service.create({
          data: {
            name: serviceType.name,
            clinicId: clinic.id,
            description: faker.lorem.paragraph(),
            recomendation: faker.lorem.sentence(),
            price: faker.number.int(serviceType.price),
            duration: faker.number.int({ min: 15, max: 120 }),
            category: serviceType.category,
            isEmergency: serviceType.category === 'Medical' && faker.datatype.boolean(),
            preparation: faker.lorem.sentence(),
            recoveryTime: `${faker.number.int({ min: 1, max: 14 })} days`,
            contraindications: faker.lorem.words(3),
            successRate: faker.number.float({ min: 85, max: 100, precision: 0.1 }),
          },
        })
      )
    );
    services.push(...clinicServices);
  }

  log.success(`Создано: ${clinics.length} клиник, ${services.length} услуг`);

  return { clinics, services };
}

async function step4_createUsers(config: SeedConfig, roles: any[]) {
  log.step(4, 10, `Создание пользователей (${config.users} шт.)...`);

  const defaultPassword = await hash('Qwerty123@');
  const userRole = roles.find(r => r.name === 'user');
  const adminRole = roles.find(r => r.name === 'admin');

  const users = await Promise.all(
    Array.from({ length: config.users }).map(async (_, i) => {
      const firstName = faker.person.firstName();
      const email = `${firstName.toLowerCase()}${i}@example.com`;
      const isAdmin = i === 0; // Первый пользователь - админ

      return prisma.user.create({
        data: {
          name: firstName,
          lastName: faker.person.lastName(),
          email,
          password: defaultPassword,
          phone: faker.phone.number(),
          avatarPath: faker.image.avatar(),
          roleId: isAdmin ? adminRole?.id : userRole?.id,
          birthDate: faker.date.past({ years: 30 }),
          address: faker.location.streetAddress(),
          emergencyContact: faker.phone.number(),
          insuranceNumber: faker.string.alphanumeric(10),
          preferences: {
            notifications: {
              email: true,
              sms: faker.datatype.boolean(),
              push: true,
            },
            language: faker.helpers.arrayElement(['en', 'ru']),
            theme: faker.helpers.arrayElement(['light', 'dark']),
          },
          socialMedia: {
            facebook: faker.internet.userName(),
            instagram: faker.internet.userName(),
          },
          lastLoginAt: faker.date.recent(),
        },
      });
    })
  );

  // Добавление клиник в избранное
  const clinics = await prisma.clinic.findMany();
  for (const user of users) {
    const randomClinics = faker.helpers.arrayElements(clinics, { min: 1, max: 3 });
    await prisma.user.update({
      where: { id: user.id },
      data: {
        preferredClinics: {
          connect: randomClinics.map(c => ({ id: c.id })),
        },
      },
    });
  }

  log.success(`Создано: ${users.length} пользователей (1 админ, ${users.length - 1} пользователей)`);
  log.info(`Админ: ${users[0].email} / Qwerty123@`);

  return users;
}

async function step5_createPets(
  config: SeedConfig,
  users: any[],
  animalTypes: any[],
  breeds: any[],
  clinics: any[],
  services: any[]
) {
  log.step(5, 10, 'Создание питомцев и связанных данных...');

  let totalPets = 0;

  for (const user of users) {
    const petCount = faker.number.int(config.petsPerUser);

    for (let i = 0; i < petCount; i++) {
      const animalType = faker.helpers.arrayElement(animalTypes);
      const breed = faker.helpers.arrayElement(breeds.filter(b => b.animalTypeId === animalType.id)) || breeds[0];

      // Генерация имени питомца в зависимости от типа
      const petNames = {
        Cat: ['Whiskers', 'Fluffy', 'Mittens', 'Shadow', 'Luna'],
        Dog: ['Buddy', 'Max', 'Bella', 'Charlie', 'Lucy'],
        Bird: ['Tweety', 'Polly', 'Rio', 'Sunny', 'Kiwi'],
        Rabbit: ['Bunny', 'Thumper', 'Cottontail', 'Hoppy', 'Snowball'],
        Hamster: ['Nibbles', 'Peanut', 'Chip', 'Pip', 'Tiny'],
      };
      const names = petNames[animalType.name as keyof typeof petNames] || ['Pet'];
      const petName = faker.helpers.arrayElement(names);

      const pet = await prisma.pet.create({
        data: {
          name: petName,
          userId: user.id,
          birthDate: faker.date.past({ years: 5 }),
          gender: faker.helpers.arrayElement(Object.values(PetGender)),
          weight: faker.number.float({ min: 1, max: 50, precision: 0.1 }),
          color: faker.color.human(),
          isSterilized: faker.datatype.boolean(),
          pedigreeNumber: faker.datatype.boolean() ? faker.string.alphanumeric(8) : null,
          insurancePolicy: faker.datatype.boolean() ? `POL-${faker.string.numeric(6)}` : null,
          foodPreferences: faker.lorem.words(3),
          behaviorNotes: faker.lorem.sentence(),
          trainingLevel: faker.helpers.arrayElement(['Basic', 'Intermediate', 'Advanced']),
          favoriteToys: faker.lorem.words(2),
          dailyRoutine: faker.lorem.sentence(),
          animalTypeId: animalType.id,
        },
      });

      totalPets++;

      // Создание связанных данных для питомца
      await createPetRelatedData(pet, breed, clinics, services, user);
    }
  }

  log.success(`Создано: ${totalPets} питомцев со всеми связанными данными`);
}

async function createPetRelatedData(pet: any, breed: any, clinics: any[], services: any[], user: any) {
  // Паспорт питомца
  await prisma.petPassport.create({
    data: {
      petId: pet.id,
      chip: faker.number.int({ min: 100000000, max: 999999999 }),
      chipInstallDate: faker.date.past(),
      breedId: breed.id,
      tattooNumber: faker.datatype.boolean() ? faker.string.numeric(6) : null,
      specialMarks: faker.datatype.boolean() ? faker.lorem.sentence() : null,
      issuingOrganization: faker.company.name(),
      registrationNumber: `REG-${faker.string.alphanumeric(6).toUpperCase()}`,
      vaccinationHistory: {
        lastVaccine: faker.date.recent().toISOString(),
        nextDue: faker.date.soon({ days: 30 }).toISOString(),
      },
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=pet-${pet.id}`,
    },
  });

  // Карта здоровья
  await prisma.petCard.create({
    data: {
      petId: pet.id,
      status: faker.helpers.arrayElement(['Healthy', 'Ill', 'Recovering']),
      health: faker.lorem.sentence(),
      vaccine: faker.lorem.words(3),
      totalSpent: faker.number.int({ min: 1000, max: 50000 }),
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
    data: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }).map((_, i) => ({
      petId: pet.id,
      url: faker.image.urlLoremFlickr({ category: 'animals' }),
      isPrimary: i === 0,
    })),
  });

  // Медикаменты
  await prisma.medication.createMany({
    data: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }).map(() => ({
      petId: pet.id,
      name: faker.helpers.arrayElement(['Antibiotic', 'Painkiller', 'Vitamins', 'Antihistamine']),
      dosage: `${faker.number.int({ min: 1, max: 5 })}mg`,
      frequency: faker.helpers.arrayElement(['once daily', 'twice daily', 'as needed']),
      startDate: faker.date.recent(),
      endDate: faker.date.future(),
      description: faker.lorem.sentence(),
    })),
  });

  // Вакцинации
  const vaccinationNames = ['Rabies', 'Distemper', 'Parvovirus', 'Feline Leukemia', 'Bordetella'];
  await prisma.vaccination.createMany({
    data: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }).map(() => ({
      petId: pet.id,
      name: faker.helpers.arrayElement(vaccinationNames),
      date: faker.date.past(),
      nextDate: faker.date.future(),
      clinicId: faker.helpers.arrayElement(clinics).id,
      description: faker.lorem.sentence(),
      files: Array.from({ length: faker.number.int({ min: 0, max: 2 }) }, () => faker.internet.url()),
    })),
  });

  // Метрики здоровья
  await prisma.healthMetric.createMany({
    data: Array.from({ length: faker.number.int({ min: 3, max: 10 }) }).map(() => ({
      petId: pet.id,
      metricType: faker.helpers.arrayElement(['Weight', 'Temperature', 'Pulse', 'Respiration']),
      value: faker.number.float({ min: 1, max: 50, precision: 0.1 }),
      notes: faker.datatype.boolean() ? faker.lorem.sentence() : null,
      recordedAt: faker.date.past(),
    })),
  });

  // Записи о груминге
  await prisma.groomingRecord.createMany({
    data: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }).map(() => ({
      petId: pet.id,
      serviceType: faker.helpers.arrayElement(['Bath', 'Haircut', 'Nail Trim', 'Ear Cleaning']),
      status: faker.helpers.arrayElement(['Active', 'Completed', 'Cancelled']),
      date: faker.date.past(),
      nextDate: faker.date.future(),
      groomerName: faker.person.fullName(),
      notes: faker.lorem.sentence(),
      cost: faker.number.float({ min: 20, max: 200, precision: 0.01 }),
    })),
  });

  // Записи о посещении клиники
  const clinic = faker.helpers.arrayElement(clinics);
  await prisma.admissionVetClinic.createMany({
    data: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map(() => ({
      petId: pet.id,
      clinicId: clinic.id,
      procedure: faker.helpers.arrayElement(['Checkup', 'Vaccination', 'Surgery', 'Dental']),
      description: faker.lorem.paragraph(),
      diagnosis: faker.lorem.words(3),
      recomendation: faker.lorem.sentence(),
      visitDate: faker.date.past(),
      nextVisitDate: faker.date.future(),
      doctorName: faker.person.fullName(),
      medications: faker.lorem.words(5),
      cost: faker.number.float({ min: 500, max: 5000, precision: 0.01 }),
      files: Array.from({ length: faker.number.int({ min: 0, max: 2 }) }, () => faker.internet.url()),
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
      name: faker.helpers.arrayElement(['Vaccination due', 'Vet appointment', 'Medication reminder']),
      description: faker.lorem.sentence(),
      type: faker.helpers.arrayElement(Object.values(NotificationType)),
      userId: user.id,
      isCompleted: faker.datatype.boolean(),
      location: clinic.name,
      repeatPattern: faker.helpers.arrayElement(['daily', 'weekly', 'monthly', null]),
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
      paymentDate: faker.date.past(),
      status: faker.helpers.arrayElement(['completed', 'pending', 'failed']),
    },
  });

  // Отзывы
  if (faker.datatype.boolean()) {
    await prisma.review.create({
      data: {
        userId: user.id,
        clinicId: clinic.id,
        rating: faker.number.int({ min: 3, max: 5 }),
        comment: faker.lorem.sentences(2),
      },
    });
  }
}

async function step6_createBoardings(config: SeedConfig, users: any[]) {
  log.step(6, 10, `Создание гостиниц для животных (${config.boardings} шт.)...`);

  const boardings = await Promise.all(
    Array.from({ length: config.boardings }).map((_, i) =>
      prisma.petBoarding.create({
        data: {
          name: `${faker.company.name()} Pet Boarding`,
          description: faker.lorem.paragraph(),
          address: faker.location.streetAddress(),
          phone: faker.phone.number(),
          email: faker.internet.email(),
          website: faker.internet.url(),
          geoCoordinates: `${faker.location.latitude()}, ${faker.location.longitude()}`,
          photos: Array.from({ length: 5 }, () => faker.image.urlLoremFlickr({ category: 'animal' })),
          pricePerDay: faker.number.float({ min: 15, max: 100, precision: 0.01 }),
          capacity: faker.number.int({ min: 5, max: 30 }),
          availableSpots: faker.number.int({ min: 1, max: 10 }),
          amenities: faker.helpers.arrayElements(
            ['Outdoor play area', '24/7 Supervision', 'Daily walks', 'Grooming', 'Veterinary care'],
            { min: 3, max: 5 }
          ),
          rules: faker.helpers.arrayElements(
            ['Vaccination required', 'Must be flea-free', 'No aggressive pets', 'Spay/neuter preferred'],
            { min: 2, max: 4 }
          ),
          checkInTime: '08:00',
          checkOutTime: '18:00',
          userId: faker.helpers.arrayElement(users).id,
        },
      })
    )
  );

  // Сотрудники гостиниц
  for (const boarding of boardings) {
    await prisma.petBoardingStaff.createMany({
      data: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }).map(() => ({
        boardingId: boarding.id,
        name: faker.person.fullName(),
        position: faker.helpers.arrayElement(['Manager', 'Caregiver', 'Groomer', 'Veterinarian']),
        phone: faker.phone.number(),
        email: faker.internet.email(),
      })),
    });
  }

  // Бронирования
  const pets = await prisma.pet.findMany();
  let bookingsCount = 0;

  for (const user of users.slice(0, Math.min(users.length, 5))) {
    const userPets = pets.filter(p => p.userId === user.id);
    if (userPets.length === 0) continue;

    const pet = faker.helpers.arrayElement(userPets);
    const startDate = faker.date.soon({ days: 5 });
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + faker.number.int({ min: 1, max: 14 }));

    const boarding = faker.helpers.arrayElement(boardings);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = boarding.pricePerDay * days;

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

    bookingsCount++;

    // Платежи для бронирований
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

    // Отзывы для завершенных бронирований
    if (booking.status === 'COMPLETED' && faker.datatype.boolean()) {
      await prisma.petBoardingReview.create({
        data: {
          bookingId: booking.id,
          userId: user.id,
          rating: faker.number.int({ min: 3, max: 5 }),
          comment: faker.lorem.sentences(2),
        },
      });
    }
  }

  log.success(`Создано: ${boardings.length} гостиниц, ${bookingsCount} бронирований`);

  return boardings;
}

async function step7_createShelters(
  config: SeedConfig,
  users: any[],
  animalTypes: any[],
  breeds: any[]
) {
  log.step(7, 10, 'Создание приютов и животных...');

  const shelterOwners = users.slice(0, Math.min(3, users.length));
  const shelters = await Promise.all(
    shelterOwners.map(owner =>
      prisma.shelter.create({
        data: {
          name: `${faker.company.name()} Animal Shelter`,
          description: faker.lorem.paragraphs(2),
          address: faker.location.streetAddress(),
          phone: faker.phone.number(),
          email: faker.internet.email(),
          website: faker.internet.url(),
          geoCoordinates: `${faker.location.latitude()}, ${faker.location.longitude()}`,
          photos: Array.from({ length: 5 }, () => faker.image.urlLoremFlickr({ category: 'animal' })),
          ownerId: owner.id,
          isActive: true,
        },
      })
    )
  );

  const shelterAnimals = [];
  for (const shelter of shelters) {
    const animalCount = faker.number.int({ min: 5, max: 15 });
    const animals = await Promise.all(
      Array.from({ length: animalCount }).map(async () => {
        const animalType = faker.helpers.arrayElement(animalTypes);
        const breed = faker.helpers.arrayElement(breeds.filter(b => b.animalTypeId === animalType.id)) || breeds[0];
        
        return prisma.shelterAnimal.create({
          data: {
            shelterId: shelter.id,
            name: faker.person.firstName(),
            animalTypeId: animalType.id,
            breedId: breed.id,
            gender: faker.helpers.arrayElement(Object.values(PetGender)),
            ageEstimate: faker.number.int({ min: 1, max: 120 }), // в месяцах
            description: faker.lorem.paragraph(),
            isAdopted: faker.datatype.boolean({ probability: 0.3 }),
            adoptionDate: faker.datatype.boolean({ probability: 0.2 }) ? faker.date.past() : null,
            photos: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => 
              faker.image.urlLoremFlickr({ category: 'animals' })
            ),
            specialNeeds: faker.datatype.boolean({ probability: 0.4 }) ? faker.lorem.sentence() : null,
          },
        });
      })
    );
    shelterAnimals.push(...animals);
  }

  log.success(`Создано: ${shelters.length} приютов, ${shelterAnimals.length} животных`);
  return { shelters, shelterAnimals };
}

async function step8_createSocialContent(
  config: SeedConfig,
  users: any[],
  shelters: any[]
) {
  log.step(8, 10, 'Создание социальных постов и взаимодействий...');

  const posts = [];
  const postTypes: PostType[] = [PostType.ANNOUNCEMENT, PostType.EVENT, PostType.BLOG, PostType.ADOPTION];

  // Посты от пользователей
  for (let i = 0; i < Math.min(20, users.length * 2); i++) {
    const user = faker.helpers.arrayElement(users);
    const postType = faker.helpers.arrayElement(postTypes);
    
    const post = await prisma.communityPost.create({
      data: {
        authorId: user.id,
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
        mediaUrls: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => 
          faker.image.urlLoremFlickr({ category: 'animals' })
        ),
        postType,
        isPinned: faker.datatype.boolean({ probability: 0.1 }),
        location: faker.datatype.boolean({ probability: 0.5 }) ? faker.location.city() : null,
        eventDate: postType === 'EVENT' ? faker.date.future() : null,
      },
    });
    posts.push(post);

    // Лайки для поста
    const likers = faker.helpers.arrayElements(users, { min: 0, max: Math.min(10, users.length) });
    await prisma.postLike.createMany({
      data: likers.map(liker => ({
        postId: post.id,
        userId: liker.id,
      })),
      skipDuplicates: true,
    });

    // Комментарии для поста
    const commentCount = faker.number.int({ min: 0, max: 5 });
    const postComments: number[] = [];
    for (let j = 0; j < commentCount; j++) {
      const commenter = faker.helpers.arrayElement(users);
      const comment = await prisma.postComment.create({
        data: {
          postId: post.id,
          userId: commenter.id,
          content: faker.lorem.sentences(faker.number.int({ min: 1, max: 2 })),
          parentId: faker.datatype.boolean({ probability: 0.3 }) && postComments.length > 0
            ? faker.helpers.arrayElement(postComments)
            : null,
        },
      });
      postComments.push(comment.id);
    }
  }

  // Посты от приютов
  for (const shelter of shelters) {
    const shelterPost = await prisma.communityPost.create({
      data: {
        shelterId: shelter.id,
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(2),
        mediaUrls: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => 
          faker.image.urlLoremFlickr({ category: 'animals' })
        ),
        postType: faker.helpers.arrayElement([PostType.ANNOUNCEMENT, PostType.ADOPTION]),
        isPinned: faker.datatype.boolean({ probability: 0.2 }),
        location: shelter.address,
      },
    });
    posts.push(shelterPost);
  }

  // Участие в событиях
  const allPosts = await prisma.communityPost.findMany({
    where: { postType: PostType.EVENT },
  });
  for (const eventPost of allPosts.slice(0, Math.min(5, allPosts.length))) {
    const participants = faker.helpers.arrayElements(users, { min: 1, max: Math.min(10, users.length) });
    const pets = await prisma.pet.findMany();
    
    await prisma.eventParticipation.createMany({
      data: participants.map(participant => ({
        postId: eventPost.id,
        userId: participant.id,
        petId: faker.datatype.boolean({ probability: 0.7 }) && pets.length > 0
          ? faker.helpers.arrayElement(pets).id
          : null,
        status: faker.helpers.arrayElement([ParticipationStatus.PENDING, ParticipationStatus.CONFIRMED, ParticipationStatus.CANCELLED]),
      })),
      skipDuplicates: true,
    });
  }

  log.success(`Создано: ${posts.length} постов, лайки, комментарии и участия в событиях`);
}

async function step9_createAdoptionAndDonations(
  config: SeedConfig,
  users: any[],
  shelters: any[],
  shelterAnimals: any[]
) {
  log.step(9, 10, 'Создание запросов на усыновление и пожертвований...');

  // Запросы на усыновление
  const availableAnimals = shelterAnimals.filter(a => !a.isAdopted);
  let adoptionRequestsCount = 0;

  for (let i = 0; i < Math.min(10, availableAnimals.length); i++) {
    const animal = faker.helpers.arrayElement(availableAnimals);
    if (animal.isAdopted) continue;

    const user = faker.helpers.arrayElement(users);
    const shelter = shelters.find(s => s.id === animal.shelterId);

    await prisma.adoptionRequest.create({
      data: {
        shelterId: shelter!.id,
        animalId: animal.id,
        userId: user.id,
        status: faker.helpers.arrayElement([AdoptionStatus.PENDING, AdoptionStatus.APPROVED, AdoptionStatus.REJECTED, AdoptionStatus.CANCELLED]),
        contactPhone: user.phone || faker.phone.number(),
        address: user.address || faker.location.streetAddress(),
        adoptionReason: faker.lorem.sentence(),
        previousExperience: faker.datatype.boolean(),
        agreementAccepted: true,
        notes: faker.datatype.boolean({ probability: 0.5 }) ? faker.lorem.sentence() : null,
        reviewedAt: faker.datatype.boolean({ probability: 0.5 }) ? faker.date.recent() : null,
      },
    });
    adoptionRequestsCount++;
  }

  // Пожертвования
  let donationsCount = 0;
  for (let i = 0; i < Math.min(15, users.length * 2); i++) {
    const shelter = faker.helpers.arrayElement(shelters);
    const user = faker.datatype.boolean({ probability: 0.8 }) 
      ? faker.helpers.arrayElement(users)
      : null;

    await prisma.donation.create({
      data: {
        shelterId: shelter.id,
        userId: user?.id || null,
        amount: faker.number.float({ min: 100, max: 10000, precision: 0.01 }),
        currency: 'RUB',
        message: faker.datatype.boolean({ probability: 0.6 }) ? faker.lorem.sentence() : null,
        anonymous: !user || faker.datatype.boolean({ probability: 0.2 }),
        recurring: faker.datatype.boolean({ probability: 0.1 }),
        status: faker.helpers.arrayElement([DonationStatus.PENDING, DonationStatus.PAID, DonationStatus.FAILED, DonationStatus.REFUNDED]),
        transactionId: faker.datatype.boolean({ probability: 0.7 })
          ? `TXN-${faker.string.numeric(8)}`
          : null,
        paidAt: faker.datatype.boolean({ probability: 0.6 }) ? faker.date.recent() : null,
      },
    });
    donationsCount++;
  }

  log.success(`Создано: ${adoptionRequestsCount} запросов на усыновление, ${donationsCount} пожертвований`);
}

async function step10_createPaymentSessionsAndJournals(
  config: SeedConfig,
  users: any[],
  services: any[]
) {
  log.step(10, 10, 'Создание платежных сессий и дневников питомцев...');

  // Платежные сессии
  let sessionsCount = 0;
  for (let i = 0; i < Math.min(20, users.length * 2); i++) {
    const user = faker.helpers.arrayElement(users);
    const service = faker.helpers.arrayElement(services);
    const serviceTypes = ['veterinary', 'grooming', 'boarding', 'charity', 'subscription'] as const;

    await prisma.paymentSession.create({
      data: {
        userId: user.id,
        amount: service.price,
        currency: 'RUB',
        description: faker.lorem.sentence(),
        status: faker.helpers.arrayElement([PaymentSessionStatus.PENDING, PaymentSessionStatus.PROCESSING, PaymentSessionStatus.PAID, PaymentSessionStatus.FAILED, PaymentSessionStatus.EXPIRED, PaymentSessionStatus.CANCELLED]),
        serviceId: service.id,
        serviceType: faker.helpers.arrayElement(serviceTypes),
        metadata: {
          petId: faker.datatype.boolean({ probability: 0.7 }) ? faker.number.int({ min: 1, max: 100 }) : null,
          clinicId: service.clinicId,
          appointmentDate: faker.date.future().toISOString(),
        },
        expiresAt: faker.date.future({ years: 0.02 }), // примерно 7 дней
        paymentMethods: faker.helpers.arrayElements(['card', 'apple_pay', 'google_pay'], { min: 1, max: 3 }),
        paidAt: faker.datatype.boolean({ probability: 0.5 }) ? faker.date.recent() : null,
      },
    });
    sessionsCount++;
  }

  // Дневники питомцев
  const pets = await prisma.pet.findMany();
  let journalsCount = 0;

  for (let i = 0; i < Math.min(30, pets.length * 2); i++) {
    const pet = faker.helpers.arrayElement(pets);
    const moods = ['игривый', 'сонный', 'активный', 'спокойный', 'взволнованный', 'грустный'];

    await prisma.petJournalEntry.create({
      data: {
        petId: pet.id,
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
        mediaUrls: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => 
          faker.image.urlLoremFlickr({ category: 'animals' })
        ),
        mood: faker.helpers.arrayElement(moods),
        location: faker.datatype.boolean({ probability: 0.5 }) ? faker.location.city() : null,
      },
    });
    journalsCount++;
  }

  log.success(`Создано: ${sessionsCount} платежных сессий, ${journalsCount} записей в дневниках`);
}

async function printStatistics() {
  console.log('');
  log.info('📊 Статистика базы данных:');

  const stats = {
    users: await prisma.user.count(),
    pets: await prisma.pet.count(),
    clinics: await prisma.clinic.count(),
    services: await prisma.service.count(),
    boardings: await prisma.petBoarding.count(),
    vaccinations: await prisma.vaccination.count(),
    medications: await prisma.medication.count(),
    payments: await prisma.payment.count(),
    reviews: await prisma.review.count(),
    shelters: await prisma.shelter.count(),
    shelterAnimals: await prisma.shelterAnimal.count(),
    communityPosts: await prisma.communityPost.count(),
    postLikes: await prisma.postLike.count(),
    postComments: await prisma.postComment.count(),
    eventParticipations: await prisma.eventParticipation.count(),
    adoptionRequests: await prisma.adoptionRequest.count(),
    donations: await prisma.donation.count(),
    paymentSessions: await prisma.paymentSession.count(),
    petJournalEntries: await prisma.petJournalEntry.count(),
  };

  for (const [key, value] of Object.entries(stats)) {
    console.log(`   ${key}: ${value}`);
  }
}

main()
  .catch(e => {
    log.error(`Ошибка при заполнении базы данных: ${e}`);
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
