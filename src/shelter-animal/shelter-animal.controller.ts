// src/shelter-animal/shelter-animal.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    UseGuards,
    Req,
    Query,
} from '@nestjs/common';
import { ShelterAnimalService } from './shelter-animal.service';
import { CreateShelterAnimalDto } from './dto/create-shelter-animal.dto';
import { UpdateShelterAnimalDto } from './dto/update-shelter-animal.dto';
import {Auth} from "../auth/decorators/auth.decorator";

@Controller('shelters/:shelterId/animals')
export class ShelterAnimalController {
    constructor(private readonly animalService: ShelterAnimalService) {}

    @Post()
    @Auth()
    create(
        @Param('shelterId') shelterId: string,
        @Body() dto: CreateShelterAnimalDto,
        @Req() req,
    ) {
        return this.animalService.createAnimal(+shelterId, req.user.id, dto);
    }

    @Get()
    findAll(
        @Param('shelterId') shelterId: string,
        @Query('type') animalTypeId?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.animalService.findAll({
            shelterId: +shelterId,
            animalTypeId: animalTypeId ? +animalTypeId : undefined,
            page: page ? +page : undefined,
            limit: limit ? +limit : undefined,
        });
    }

    // Общедоступный список всех животных (для главной страницы "Найти питомца")
    @Get('all')
    findAllPublic(
        @Query('shelter') shelterId?: string,
        @Query('type') animalTypeId?: string,
        @Query('adopted') isAdopted?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.animalService.findAll({
            shelterId: shelterId ? +shelterId : undefined,
            animalTypeId: animalTypeId ? +animalTypeId : undefined,
            isAdopted: isAdopted === 'true',
            page: page ? +page : undefined,
            limit: limit ? +limit : undefined,
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.animalService.findOne(+id);
    }

    @Patch(':id')
    @Auth()
    update(
        @Param('shelterId') shelterId: string,
        @Param('id') id: string,
        @Body() dto: UpdateShelterAnimalDto,
        @Req() req,
    ) {
        return this.animalService.updateAnimal(+shelterId, req.user.id, +id, dto);
    }

    @Patch(':id/adopt')
    @Auth()
    adopt(
        @Param('shelterId') shelterId: string,
        @Param('id') id: string,
        @Req() req,
    ) {
        return this.animalService.markAsAdopted(+shelterId, req.user.id, +id);
    }
}