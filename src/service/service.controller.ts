// src/service/service.controller.ts
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
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller('clinics/:clinicId/services')
export class ServiceController {
    constructor(private readonly serviceService: ServiceService) {}

    @Post()
    @Auth()
    create(
        @Param('clinicId') clinicId: string,
        @Body() dto: CreateServiceDto,
        @Req() req,
    ) {
        return this.serviceService.createService(+clinicId, req.user.id, dto);
    }

    @Get()
    findAll(
        @Param('clinicId') clinicId: string,
        @Query('category') category?: string,
    ) {
        return this.serviceService.findAllForClinic(+clinicId, category);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.serviceService.findOne(+id);
    }

    @Patch(':id')
    @Auth()
    update(
        @Param('clinicId') clinicId: string,
        @Param('id') id: string,
        @Body() dto: UpdateServiceDto,
        @Req() req,
    ) {
        return this.serviceService.updateService(+clinicId, req.user.id, +id, dto);
    }

    @Delete(':id')
    @Auth()
    remove(
        @Param('clinicId') clinicId: string,
        @Param('id') id: string,
        @Req() req,
    ) {
        return this.serviceService.removeService(+clinicId, req.user.id, +id);
    }
}