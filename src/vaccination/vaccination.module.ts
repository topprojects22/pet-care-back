import { Module } from "@nestjs/common";
import { VaccinationService } from "./vaccination.service";
import { VaccinationController } from "./vaccination.controller";
import { PrismaService } from "../prisma.service";

@Module({
  controllers: [VaccinationController],
  providers: [VaccinationService, PrismaService],
})
export class VaccinationModule {}
