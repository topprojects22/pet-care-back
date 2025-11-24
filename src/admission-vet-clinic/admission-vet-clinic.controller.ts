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
    Query,
} from '@nestjs/common';
import { AdmissionVetClinicService } from './admission-vet-clinic.service';
import { CreateAdmissionVetClinicDto } from './dto/create-admission-vet-clinic.dto';
import { UpdateAdmissionVetClinicDto } from './dto/update-admission-vet-clinic.dto';
import { GetVetVisitsQueryDto } from './dto/get-vet-visits-query.dto';
import { Auth } from "../auth/decorators/auth.decorator";
import { Resource } from '../common/decorators/resource.decorator';
import { OwnershipGuard } from '../common/guards/ownership.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { User } from '@prisma/client';

@Controller('pets/:petId/vet-visits')
export class AdmissionVetClinicController {
    constructor(private readonly admissionService: AdmissionVetClinicService) {}

    @Post()
    @Auth()
    @Resource('pet')
    @UseGuards(OwnershipGuard)
    create(
        @Param('petId') petId: string,
        @Body() dto: CreateAdmissionVetClinicDto,
        @CurrentUser() user: User,
    ) {
        return this.admissionService.createAdmission(user.id, +petId, dto);
    }

    @Get()
    @Auth()
    @Resource('pet')
    @UseGuards(OwnershipGuard)
    findAll(
        @Param('petId') petId: string,
        @Query() query: GetVetVisitsQueryDto,
    ) {
        return this.admissionService.findAllForPet(
            +petId,
            query,
        );
    }

    @Get(':id')
    @Auth()
    @Resource('vetVisit')
    @UseGuards(OwnershipGuard)
    findOne(@Param('id') id: string) {
        return this.admissionService.findOne(+id);
    }

    @Patch(':id')
    @Auth()
    @Resource('vetVisit')
    @UseGuards(OwnershipGuard)
    update(
        @Param('id') id: string,
        @Body() dto: UpdateAdmissionVetClinicDto,
        @CurrentUser() user: User,
    ) {
        return this.admissionService.updateAdmission(user.id, +id, dto);
    }

    @Delete(':id')
    @Auth()
    @Resource('vetVisit')
    @UseGuards(OwnershipGuard)
    remove(@Param('id') id: string, @CurrentUser() user: User) {
        return this.admissionService.removeAdmission(user.id, +id);
    }
}