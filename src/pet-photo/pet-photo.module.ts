// src/pet-photo/pet-photo.module.ts
import { Module } from '@nestjs/common';
import { PetPhotoController } from './pet-photo.controller';
import { PetPhotoService } from './pet-photo.service';
import { PrismaService } from '../prisma.service';
import { FileUploadService } from '../common/services/file-upload.service';
import { FileStorageService } from '../common/services/file-storage.service';

@Module({
    controllers: [PetPhotoController],
    providers: [
        PetPhotoService,
        PrismaService,
        FileUploadService,
        FileStorageService,
    ],
    exports: [PetPhotoService],
})
export class PetPhotoModule {}