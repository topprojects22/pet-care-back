// src/staff-member/staff-member.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    Query,
} from '@nestjs/common';
import { StaffMemberService } from './staff-member.service';
import { CreateStaffMemberDto } from './dto/create-staff-member.dto';
import { UpdateStaffMemberDto } from './dto/update-staff-member.dto';
import { Auth } from "../auth/decorators/auth.decorator";
import { CurrentUser } from "../common/decorators/user.decorator";
import { User } from "@prisma/client";

@Controller('clinics/:clinicId/staff')
export class StaffMemberController {
    constructor(private readonly staffService: StaffMemberService) {}

    @Post()
    @Auth()
    create(
        @Param('clinicId') clinicId: string,
        @Body() dto: CreateStaffMemberDto,
        @CurrentUser() user: User,
    ) {
        return this.staffService.createStaffMember(+clinicId, user.id, dto);
    }

    @Get()
    findAll(
        @Param('clinicId') clinicId: string,
        @Query('active') active?: string,
    ) {
        return this.staffService.findAllForClinic(+clinicId, active !== 'false');
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.staffService.findOne(+id);
    }

    @Patch(':id')
    @Auth()
    update(
        @Param('clinicId') clinicId: string,
        @Param('id') id: string,
        @Body() dto: UpdateStaffMemberDto,
        @CurrentUser() user: User,
    ) {
        return this.staffService.updateStaffMember(+clinicId, user.id, +id, dto);
    }

    @Delete(':id')
    @Auth()
    remove(
        @Param('clinicId') clinicId: string,
        @Param('id') id: string,
        @CurrentUser() user: User,
    ) {
        return this.staffService.removeStaffMember(+clinicId, user.id, +id);
    }
}