// src/pet-journal/pet-journal-entry.controller.ts
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
import { PetJournalEntryService } from './pet-journal-entry.service';
import { CreatePetJournalEntryDto } from './dto/create-pet-journal-entry.dto';
import { UpdatePetJournalEntryDto } from './dto/update-pet-journal-entry.dto';
import { Auth } from "../auth/decorators/auth.decorator";
import { CurrentUser } from "../common/decorators/user.decorator";
import { User } from "@prisma/client";

@Controller('pets/:petId/journal')
export class PetJournalEntryController {
    constructor(private readonly journalService: PetJournalEntryService) {}

    @Post()
    @Auth()
    create(
        @Param('petId') petId: string,
        @Body() dto: CreatePetJournalEntryDto,
        @CurrentUser() user: User,
    ) {
        return this.journalService.createEntry(user.id, +petId, dto);
    }

    @Get()
    findAll(
        @Param('petId') petId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.journalService.findAllForPet(
            +petId,
            page ? +page : undefined,
            limit ? +limit : undefined,
        );
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.journalService.findOne(+id);
    }

    @Patch(':id')
    @Auth()
    update(
        @Param('petId') petId: string,
        @Param('id') id: string,
        @Body() dto: UpdatePetJournalEntryDto,
        @CurrentUser() user: User,
    ) {
        return this.journalService.updateEntry(user.id, +id, dto);
    }

    @Delete(':id')
    @Auth()
    remove(@Param('id') id: string, @CurrentUser() user: User) {
        return this.journalService.removeEntry(user.id, +id);
    }
}