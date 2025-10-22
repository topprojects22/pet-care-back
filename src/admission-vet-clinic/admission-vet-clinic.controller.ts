// src/admission-vet-clinic/admission-vet-clinic.controller.ts
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
} from '@nestjs/common';
import { AdmissionVetClinicService } from './admission-vet-clinic.service';
import { CreateAdmissionVetClinicDto } from './dto/create-admission-vet-clinic.dto';
import { UpdateAdmissionVetClinicDto } from './dto/update-admission-vet-clinic.dto';
import {Auth} from "../auth/decorators/auth.decorator";

@Controller('pets/:petId/vet-visits')
export class AdmissionVetClinicController {
    constructor(private readonly admissionService: AdmissionVetClinicService) {}

    @Post()
    @Auth()
    create(
        @Param('petId') petId: string,
        @Body() dto: CreateAdmissionVetClinicDto,
        @Req() req,
    ) {
        return this.admissionService.createAdmission(req.user.id, +petId, dto);
    }

    @Get()
    findAll(@Param('petId') petId: string) {
        return this.admissionService.findAllForPet(+petId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.admissionService.findOne(+id);
    }

    @Patch(':id')
    @Auth()
    update(
        @Param('id') id: string,
        @Body() dto: UpdateAdmissionVetClinicDto,
        @Req() req,
    ) {
        return this.admissionService.updateAdmission(req.user.id, +id, dto);
    }

    @Delete(':id')
    @Auth()
    remove(@Param('id') id: string, @Req() req) {
        return this.admissionService.removeAdmission(req.user.id, +id);
    }
}