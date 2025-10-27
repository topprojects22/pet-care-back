// src/staff-member/staff-member.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    UseGuards,
    Req,
    Query,
} from '@nestjs/common';
import { StaffMemberService } from './staff-member.service';
import { CreateStaffMemberDto } from './dto/create-staff-member.dto';
import { UpdateStaffMemberDto } from './dto/update-staff-member.dto';
import {Auth} from "../auth/decorators/auth.decorator";

@Controller('clinics/:clinicId/staff')
export class StaffMemberController {
    constructor(private readonly staffService: StaffMemberService) {}

    @Post()
    @Auth()
    create(
        @Param('clinicId') clinicId: string,
        @Body() dto: CreateStaffMemberDto,
        @Req() req,
    ) {
        return this.staffService.createStaffMember(+clinicId, req.user.id, dto);
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
        @Req() req,
    ) {
        return this.staffService.updateStaffMember(+clinicId, req.user.id, +id, dto);
    }

    @Delete(':id')
    @Auth()
    remove(
        @Param('clinicId') clinicId: string,
        @Param('id') id: string,
        @Req() req,
    ) {
        return this.staffService.removeStaffMember(+clinicId, req.user.id, +id);
    }
}