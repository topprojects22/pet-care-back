// src/grooming-record/grooming-record.module.ts
import { Module } from '@nestjs/common';
import { GroomingRecordController } from './grooming-record.controller';
import { GroomingRecordService } from './grooming-record.service';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [GroomingRecordController],
    providers: [GroomingRecordService, PrismaService],
    exports: [GroomingRecordService],
})
export class GroomingRecordModule {}