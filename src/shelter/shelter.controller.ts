// src/shelter/shelter.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
} from '@nestjs/common';
import { ShelterService } from './shelter.service';
import { CreateShelterDto } from './dto/create-shelter.dto';
import { UpdateShelterDto } from './dto/update-shelter.dto';
import {Auth} from "../auth/decorators/auth.decorator";

@Controller('shelters')
export class ShelterController {
    constructor(private readonly shelterService: ShelterService) {}

    @Post()
    @Auth()
    create(@Body() dto: CreateShelterDto, @Req() req) {
        return this.shelterService.createShelter(req.user.id, dto);
    }

    @Get()
    findAll() {
        return this.shelterService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.shelterService.findOne(+id);
    }

    @Patch(':id')
    @Auth()
    update(@Param('id') id: string, @Body() dto: UpdateShelterDto, @Req() req) {
        return this.shelterService.updateShelter(req.user.id, +id, dto);
    }

    @Delete(':id')
    @Auth()
    remove(@Param('id') id: string, @Req() req) {
        return this.shelterService.removeShelter(req.user.id, +id);
    }
}