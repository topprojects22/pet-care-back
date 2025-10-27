import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { PrismaService } from "./prisma.service";
import { ConfigModule } from "@nestjs/config";
import { PaginationModule } from "./pagination/pagination.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
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

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      serveRoot: "../public",
      rootPath: join(__dirname, "../public"),
      exclude: ["/api*"],
    }),
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
    MedicalServicesModule,
    GroomingRecordModule,
    EventParticipationModule,
    CommunityPostModule,
    AdmissionVetClinicModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
