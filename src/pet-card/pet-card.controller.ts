// src/pet-card/pet-card.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
} from '@nestjs/common';
import { PetCardService } from './pet-card.service';
import { CreatePetCardDto } from './dto/create-pet-card.dto';
import { UpdatePetCardDto } from './dto/update-pet-card.dto';
import { Auth } from "../auth/decorators/auth.decorator";
import { CurrentUser } from "../common/decorators/user.decorator";
import { User } from "@prisma/client";

@Controller('pets/:petId/card')
export class PetCardController {
    constructor(private readonly cardService: PetCardService) {}

    @Post()
    @Auth()
    create(
        @Param('petId') petId: string,
        @Body() dto: CreatePetCardDto,
        @CurrentUser() user: User,
    ) {
        return this.cardService.createCard(user.id, +petId, dto);
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
        @CurrentUser() user: User,
    ) {
        return this.cardService.updateCard(user.id, +petId, dto);
    }
}