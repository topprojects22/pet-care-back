// src/pet-photo/pet-photo.module.ts
import { Module } from '@nestjs/common';
import { PetPhotoController } from './pet-photo.controller';
import { PetPhotoService } from './pet-photo.service';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [PetPhotoController],
    providers: [PetPhotoService, PrismaService],
    exports: [PetPhotoService],
})
export class PetPhotoModule {}