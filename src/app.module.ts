import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { McpModule } from '@nestjs-mcp/server';
import { PaginationModule } from "./pagination/pagination.module";
import { PetModule } from "./pet/pet.module";
import { NotificationModule } from "./notification/notification.module";
import { GroomingModule } from "./grooming/grooming.module";
import { MedicalServicesModule } from "./medicalServices/medicalServices.module";
import { PetBoardingModule } from "./petBoarding/petBoarding.module";
import { VaccinationModule } from "./vaccination/vaccination.module";
import { MedicationModule } from "./medication/medication.module";
import { ShelterAnimalModule } from "./shelter-animal/shelter-animal.module";
import { ShelterModule } from "./shelter/shelter.module";
import { StaffMemberModule } from "./staff-member/staff-member.module";
import { ServiceModule } from "./service/service.module";
import { ReviewModule } from "./review/review.module";
import { PetPhotoModule } from "./pet-photo/pet-photo.module";
import { PetPassportModule } from "./pet-passport/pet-passport.module";
import { PetJournalEntryModule } from "./pet-journal/pet-journal-entry.module";
import { PetBoardingReviewModule } from "./pet-boarding-review/pet-boarding-review.module";
import { PaymentModule } from "./payment/payment.module";
import { GroomingRecordModule } from "./grooming-record/grooming-record.module";
import { EventParticipationModule } from "./event-participation/event-participation.module";
import { CommunityPostModule } from "./community-post/community-post.module";
import { AdmissionVetClinicModule } from "./admission-vet-clinic/admission-vet-clinic.module";
import { HealthModule } from "./health/health.module";
import { SubscriptionModule } from "./subscription/subscription.module";
import { LoggingMiddleware } from "./common/middleware/logging.middleware";
import { CacheModule } from "./common/cache/cache.module";
import { LoggerModule } from "./common/logger/logger.module";
import { MetricsModule } from "./common/metrics/metrics.module";
import { DatabaseMetricsInterceptor } from "./common/interceptors/database-metrics.interceptor";
import { PrismaService } from "./prisma.service";
import appConfig from "./config/app.config";
import { validationSchema } from "./config/validation.schema";

@Module({
  imports: [
    // Конфигурация с валидацией
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 минута
        limit: 100, // 100 запросов
      },
    ]),
    // MCP Module
    McpModule.forRoot({
      name: 'Pet Care Backend',
      version: '1.0.0',
    }),
    // Feature Modules
    UserModule,
    AuthModule,
    PaginationModule,
    PetModule,
    NotificationModule,
    GroomingModule,
    MedicalServicesModule,
    PetBoardingModule,
    VaccinationModule,
    MedicationModule,
    ShelterAnimalModule,
    ShelterModule,
    StaffMemberModule,
    ServiceModule,
    ReviewModule,
    PetPhotoModule,
    PetPassportModule,
    PetJournalEntryModule,
    PetBoardingReviewModule,
    PaymentModule,
    GroomingRecordModule,
    EventParticipationModule,
    CommunityPostModule,
    AdmissionVetClinicModule,
    HealthModule,
    SubscriptionModule,
    // Infrastructure modules
    CacheModule,
    LoggerModule,
    MetricsModule,
  ],
  controllers: [],
  providers: [
    PrismaService,
    {
      provide: 'PrismaService',
      useExisting: PrismaService,
    },
    // Глобальный Rate Limiting Guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Database Metrics Interceptor (для отслеживания запросов к БД)
    DatabaseMetricsInterceptor,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Логирование всех HTTP запросов
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
