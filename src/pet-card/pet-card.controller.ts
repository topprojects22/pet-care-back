// src/pet-card/pet-card.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    UseGuards,
    Req,
} from '@nestjs/common';
import { PetCardService } from './pet-card.service';
import { CreatePetCardDto } from './dto/create-pet-card.dto';
import { UpdatePetCardDto } from './dto/update-pet-card.dto';
import {Auth} from "../auth/decorators/auth.decorator";

@Controller('pets/:petId/card')
export class PetCardController {
    constructor(private readonly cardService: PetCardService) {}

    @Post()
    @Auth()
    create(
        @Param('petId') petId: string,
        @Body() dto: CreatePetCardDto,
        @Req() req,
    ) {
        return this.cardService.createCard(req.user.id, +petId, dto);
    }

    @Get()
    findOne(@Param('petId') petId: string) {
        return this.cardService.findOneByPetId(+petId);
    }

    @Patch()
    @Auth()
    update(
        @Param('petId') petId: string,
        @Body() dto: UpdatePetCardDto,
        @Req() req,
    ) {
        return this.cardService.updateCard(req.user.id, +petId, dto);
    }
}