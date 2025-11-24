// src/shelter/shelter.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import { ShelterService } from './shelter.service';
import { CreateShelterDto } from './dto/create-shelter.dto';
import { UpdateShelterDto } from './dto/update-shelter.dto';
import { AdoptAnimalDto } from './dto/adopt-animal.dto';
import { CreateDonationDto } from './dto/create-donation.dto';
import { Auth } from "../auth/decorators/auth.decorator";
import { CurrentUser } from '../common/decorators/user.decorator';
import { User } from '@prisma/client';

@Controller('shelters')
export class ShelterController {
    constructor(private readonly shelterService: ShelterService) {}

    @Post()
    @Auth()
    create(@Body() dto: CreateShelterDto, @CurrentUser() user: User) {
        return this.shelterService.createShelter(user.id, dto);
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
    update(@Param('id') id: string, @Body() dto: UpdateShelterDto, @CurrentUser() user: User) {
        return this.shelterService.updateShelter(user.id, +id, dto);
    }

    @Delete(':id')
    @Auth()
    remove(@Param('id') id: string, @CurrentUser() user: User) {
        return this.shelterService.removeShelter(user.id, +id);
    }

    @Post(':shelterId/animals/:animalId/adopt')
    @Auth()
    async adoptAnimal(
        @Param('shelterId') shelterId: string,
        @Param('animalId') animalId: string,
        @Body() dto: AdoptAnimalDto,
        @CurrentUser() user: User
    ) {
        return this.shelterService.adoptAnimal(
            user.id,
            +shelterId,
            +animalId,
            dto
        );
    }

    @Post(':shelterId/donations')
    @Auth()
    async createDonation(
        @Param('shelterId') shelterId: string,
        @Body() dto: CreateDonationDto,
        @CurrentUser() user: User
    ) {
        return this.shelterService.createDonation(
            user.id,
            +shelterId,
            dto
        );
    }
}