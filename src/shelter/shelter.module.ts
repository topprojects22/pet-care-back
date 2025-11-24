// src/shelter/shelter.module.ts
import { Module } from '@nestjs/common';
import { ShelterController } from './shelter.controller';
import { ShelterService } from './shelter.service';
import { PrismaService } from '../prisma.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule, MailerModule],
    controllers: [ShelterController],
    providers: [ShelterService, PrismaService],
    exports: [ShelterService],
})
export class ShelterModule {}