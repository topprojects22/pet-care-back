// src/service/service.module.ts
import { Module } from '@nestjs/common';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [ServiceController],
    providers: [ServiceService, PrismaService],
    exports: [ServiceService],
})
export class ServiceModule {}