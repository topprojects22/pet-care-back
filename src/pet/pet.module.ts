import { Module } from '@nestjs/common';
import { PetService } from './pet.service';
import { PetController } from './pet.controller';
import { PrismaService } from '../prisma.service';
import { PassportPdfService } from './services/passport-pdf.service';

@Module({
  controllers: [PetController],
  providers: [PetService, PrismaService, PassportPdfService],
})
export class PetModule {}
