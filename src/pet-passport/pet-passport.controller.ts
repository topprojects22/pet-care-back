// src/pet-passport/pet-passport.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Res,
} from '@nestjs/common';
import { Response } from 'express';
import { PetPassportService } from './pet-passport.service';
import { CreatePetPassportDto } from './dto/create-pet-passport.dto';
import { UpdatePetPassportDto } from './dto/update-pet-passport.dto';
import { Auth } from "../auth/decorators/auth.decorator";
import { Resource } from '../common/decorators/resource.decorator';
import { OwnershipGuard } from '../common/guards/ownership.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/user.decorator';
import { User } from '@prisma/client';

@Controller('pets/:petId/passport')
export class PetPassportController {
    constructor(private readonly passportService: PetPassportService) {}

    @Post()
    @Auth()
    @Resource('pet')
    @UseGuards(OwnershipGuard)
    create(
        @Param('petId') petId: string,
        @Body() dto: CreatePetPassportDto,
        @CurrentUser() user: User,
    ) {
        return this.passportService.createPassport(user.id, +petId, dto);
    }

    @Get()
    @Auth()
    @Resource('pet')
    @UseGuards(OwnershipGuard)
    async findOne(@Param('petId') petId: string) {
        return this.passportService.findOneByPetId(+petId);
    }

    @Patch()
    @Auth()
    @Resource('pet')
    @UseGuards(OwnershipGuard)
    update(
        @Param('petId') petId: string,
        @Body() dto: UpdatePetPassportDto,
        @CurrentUser() user: User,
    ) {
        return this.passportService.updatePassport(user.id, +petId, dto);
    }

    @Get('pdf')
    @Auth()
    @Resource('pet')
    @UseGuards(OwnershipGuard)
    async getPdf(@Param('petId') petId: string, @Res() res: Response) {
        const pdf = await this.passportService.generatePdf(+petId);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=pet-passport-${petId}.pdf`,
        });
        res.send(pdf);
    }

    @Get('qr')
    @Auth()
    @Resource('pet')
    @UseGuards(OwnershipGuard)
    async getQrCode(
        @Param('petId') petId: string,
        @Res() res: Response,
    ) {
        const qrCodeBuffer = await this.passportService.generateQrCodeImage(+petId);
        res.setHeader('Content-Type', 'image/png');
        res.send(qrCodeBuffer);
    }
}