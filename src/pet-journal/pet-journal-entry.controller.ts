// src/pet-journal/pet-journal-entry.controller.ts
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
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PetJournalEntryService } from './pet-journal-entry.service';
import { CreatePetJournalEntryDto } from './dto/create-pet-journal-entry.dto';
import { UpdatePetJournalEntryDto } from './dto/update-pet-journal-entry.dto';

@Controller('pets/:petId/journal')
export class PetJournalEntryController {
    constructor(private readonly journalService: PetJournalEntryService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    create(
        @Param('petId') petId: string,
        @Body() dto: CreatePetJournalEntryDto,
        @Req() req,
    ) {
        return this.journalService.createEntry(req.user.id, +petId, dto);
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
    @UseGuards(JwtAuthGuard)
    update(
        @Param('petId') petId: string,
        @Param('id') id: string,
        @Body() dto: UpdatePetJournalEntryDto,
        @Req() req,
    ) {
        return this.journalService.updateEntry(req.user.id, +id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(@Param('id') id: string, @Req() req) {
        return this.journalService.removeEntry(req.user.id, +id);
    }
}