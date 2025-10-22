// src/pet-photo/pet-photo.controller.ts
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
import { PetPhotoService } from './pet-photo.service';
import { CreatePetPhotoDto } from './dto/create-pet-photo.dto';
import { UpdatePetPhotoDto } from './dto/update-pet-photo.dto';
import {Auth} from "../auth/decorators/auth.decorator";

@Controller('pets/:petId/photos')
export class PetPhotoController {
    constructor(private readonly photoService: PetPhotoService) {}

    @Post()
    @Auth()
    create(
        @Param('petId') petId: string,
        @Body() dto: CreatePetPhotoDto,
        @Req() req,
    ) {
        return this.photoService.createPhoto(req.user.id, +petId, dto);
    }

    @Get()
    findAll(@Param('petId') petId: string) {
        return this.photoService.findAllForPet(+petId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.photoService.findOne(+id);
    }

    @Patch(':id')
    @Auth()
    update(
        @Param('id') id: string,
        @Body() dto: UpdatePetPhotoDto,
        @Req() req,
    ) {
        return this.photoService.updatePhoto(req.user.id, +id, dto);
    }

    @Delete(':id')
    @Auth()
    remove(@Param('id') id: string, @Req() req) {
        return this.photoService.removePhoto(req.user.id, +id);
    }

    @Patch(':id/primary')
    @Auth()
    setPrimary(@Param('id') id: string, @Req() req) {
        return this.photoService.setPrimary(req.user.id, +id);
    }
}