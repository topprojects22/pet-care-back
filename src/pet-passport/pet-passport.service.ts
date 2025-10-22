// src/pet-passport/services/pet-passport.service.ts
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePetPassportDto } from '../dto/create-pet-passport.dto';
import { PassportPdfGeneratorService } from './passport-pdf-generator.service';
import {UpdatePetPassportDto} from "./dto/update-pet-passport.dto";

@Injectable()
export class PetPassportService {
    constructor(
        private prisma: PrismaService,
        private pdfGenerator: PassportPdfGeneratorService,
    ) {}

    async createPassport(userId: number, petId: number, dto: CreatePetPassportDto) {
        // Проверка: питомец существует и принадлежит пользователю
        const pet = await this.prisma.pet.findUnique({
            where: { id: petId, userId },
        });
        if (!pet) throw new ForbiddenException('Pet not found or not yours');

        // Проверка: паспорт ещё не создан
        const existing = await this.prisma.petPassport.findUnique({ where: { petId } });
        if (existing) throw new BadRequestException('Passport already exists');

        // Проверка породы (если указана)
        if (dto.breedId) {
            const breed = await this.prisma.animalBreed.findUnique({
                where: { id: dto.breedId },
            });
            if (!breed) throw new BadRequestException('Invalid breed');
        }

        // Генерация QR-кода (например, на основе petId + chip)
        const qrCode = `https://petcare.app/pet/${petId}/passport?chip=${dto.chip}`;

        const passport = await this.prisma.petPassport.create({
        dara: {
        ...dto,
            petId,
            qrCode,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        include: {
            pet: { select: { id: true, name: true } },
            breed: true,
        },
    });

        return passport;
    }

    async findOneByPetId(petId: number) {
        const passport = await this.prisma.petPassport.findUnique({
            where: { petId },
            include: {
                pet: {
                    include: {
                        user: { select: { name: true, lastName: true, phone: true } },
                    },
                },
                breed: true,
            },
        });

        if (!passport) throw new NotFoundException('Passport not found');
        return passport;
    }

    async updatePassport(userId: number, petId: number, dto: UpdatePetPassportDto) {
        const passport = await this.findOneByPetId(petId);

        // Проверка прав через питомца
        const pet = await this.prisma.pet.findUnique({
            where: { id: petId },
            select: { userId: true },
        });
        if (pet.userId !== userId) throw new ForbiddenException('Not your pet');

        return this.prisma.petPassport.update({
            where: { petId },
            dto,
        });
    }

    async generatePdf(petId: number): Promise<Buffer> {
        const passport = await this.findOneByPetId(petId);
        return this.pdfGenerator.generatePdf(passport);
    }
}