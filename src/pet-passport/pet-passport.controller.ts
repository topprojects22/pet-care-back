// src/pet-passport/pet-passport.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    UseGuards,
    Req,
    Res,
} from '@nestjs/common';
import { Response } from 'express';
import { PetPassportService } from './pet-passport.service';
import { CreatePetPassportDto } from './dto/create-pet-passport.dto';
import { UpdatePetPassportDto } from './dto/update-pet-passport.dto';
import {Auth} from "../auth/decorators/auth.decorator";

@Controller('pets/:petId/passport')
export class PetPassportController {
    constructor(private readonly passportService: PetPassportService) {}

    @Post()
    @Auth()
    create(
        @Param('petId') petId: string,
        @Body() dto: CreatePetPassportDto,
        @Req() req,
    ) {
        return this.passportService.createPassport(req.user.id, +petId, dto);
    }

    @Get()
    async findOne(@Param('petId') petId: string) {
        return this.passportService.findOneByPetId(+petId);
    }

    @Patch()
    @Auth()
    update(
        @Param('petId') petId: string,
        @Body() dto: UpdatePetPassportDto,
        @Req() req,
    ) {
        return this.passportService.updatePassport(req.user.id, +petId, dto);
    }

    @Get('pdf')
    async getPdf(@Param('petId') petId: string, @Res() res: Response) {
        const pdf = await this.passportService.generatePdf(+petId);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=pet-passport-${petId}.pdf`,
        });
        res.send(pdf);
    }

    @Get('qr')
    async getQrCode(@Param('petId') petId: string) {
        const passport = await this.passportService.findOneByPetId(+petId);
        return { qrCode: passport.qrCode };
    }
}