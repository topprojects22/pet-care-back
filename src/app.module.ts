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
    MedicationModule
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
