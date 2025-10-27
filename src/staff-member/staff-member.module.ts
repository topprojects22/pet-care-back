// src/staff-member/staff-member.module.ts
import { Module } from '@nestjs/common';
import { StaffMemberController } from './staff-member.controller';
import { StaffMemberService } from './staff-member.service';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [StaffMemberController],
    providers: [StaffMemberService, PrismaService],
    exports: [StaffMemberService],
})
export class StaffMemberModule {}