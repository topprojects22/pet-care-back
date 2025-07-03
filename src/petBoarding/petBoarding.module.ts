import { Module } from "@nestjs/common";
import { PetBoardingService } from "./petBoarding.service";
import { PetBoardingController } from "./petBoarding.controller";
import { PrismaService } from "../prisma.service";

@Module({
  controllers: [PetBoardingController],
  providers: [PetBoardingService, PrismaService],
})
export class PetBoardingModule {}
