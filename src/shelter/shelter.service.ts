// src/shelter/shelter.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateShelterDto } from './dto/create-shelter.dto';
import { UpdateShelterDto } from './dto/update-shelter.dto';
import { AdoptAnimalDto } from './dto/adopt-animal.dto';
import { CreateDonationDto } from './dto/create-donation.dto';
import { randomBytes } from 'crypto';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { isDevelopment } from '../common/utils/env.util';

@Injectable()
export class ShelterService {
    private readonly logger = new Logger(ShelterService.name);

    constructor(
        private prisma: PrismaService,
        private mailerService: MailerService,
        private configService: ConfigService,
    ) {}

    async createShelter(userId: number, dto: CreateShelterDto) {
        // Проверка: может ли пользователь создавать приют?
        // (опционально: проверка роли или флага)

        const shelter = await this.prisma.shelter.create({
            data: {
                ...dto,
                owner: {
                    connect: { id: userId },
                },
                isActive: true,
                registrationDate: new Date(),
            },
        });

        return shelter;
    }

    async findAll() {
        return this.prisma.shelter.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                description: true,
                address: true,
                phone: true,
                email: true,
                website: true,
                geoCoordinates: true,
                photos: true,
                registrationDate: true,
                _count: {
                    select: { animals: true, posts: true },
                },
            },
        });
    }

    async findOne(id: number) {
        const shelter = await this.prisma.shelter.findUnique({
            where: { id },
            include: {
                animals: {
                    where: { isAdopted: false },
                    select: { id: true, name: true, photos: true, description: true },
                },
                posts: {
                    where: { isPinned: true },
                    take: 3,
                },
            },
        });

        if (!shelter) throw new NotFoundException('Shelter not found');
        if (!shelter.isActive) throw new NotFoundException('Shelter not found');
        return shelter;
    }

    async updateShelter(userId: number, shelterId: number, dto: UpdateShelterDto) {
        const shelter = await this.prisma.shelter.findUnique({
            where: { id: shelterId },
        });

        if (!shelter) throw new NotFoundException('Shelter not found');
        if (shelter.ownerId !== userId) throw new ForbiddenException('Not your shelter');

        return this.prisma.shelter.update({
            where: { id: shelterId },
            data: dto,
        });
    }

    async removeShelter(userId: number, shelterId: number) {
        const shelter = await this.prisma.shelter.findUnique({
            where: { id: shelterId },
        });

        if (!shelter) throw new NotFoundException('Shelter not found');
        if (shelter.ownerId !== userId) throw new ForbiddenException('Not your shelter');

        // Мягкое удаление
        return this.prisma.shelter.update({
            where: { id: shelterId },
            data: { isActive: false },
        });
    }

    /**
     * Создание заявки на усыновление питомца
     */
    async adoptAnimal(
        userId: number,
        shelterId: number,
        animalId: number,
        dto: AdoptAnimalDto
    ) {
        // Проверяем существование приюта
        const shelter = await this.prisma.shelter.findUnique({
            where: { id: shelterId },
        });

        if (!shelter || !shelter.isActive) {
            throw new NotFoundException('Shelter not found');
        }

        // Проверяем существование животного
        const animal = await this.prisma.shelterAnimal.findUnique({
            where: { id: animalId },
            include: { shelter: true },
        });

        if (!animal) {
            throw new NotFoundException('Animal not found');
        }

        // Проверяем, что животное принадлежит этому приюту
        if (animal.shelterId !== shelterId) {
            throw new BadRequestException('Animal does not belong to this shelter');
        }

        // Проверяем, не усыновлено ли уже животное
        if (animal.isAdopted) {
            throw new ConflictException('Animal is already adopted');
        }

        // Проверяем, не подана ли уже заявка от этого пользователя
        const existingRequest = await this.prisma.adoptionRequest.findUnique({
            where: {
                animalId_userId: {
                    animalId,
                    userId,
                },
            },
        });

        if (existingRequest) {
            throw new ConflictException('You have already submitted an adoption request for this animal');
        }

        // Проверяем согласие на обработку данных
        if (!dto.agreementAccepted) {
            throw new BadRequestException('You must accept the agreement to proceed');
        }

        // Создаем заявку на усыновление
        const adoptionRequest = await this.prisma.adoptionRequest.create({
            data: {
                shelterId,
                animalId,
                userId,
                contactPhone: dto.contactPhone,
                address: dto.address,
                adoptionReason: dto.adoptionReason,
                previousExperience: dto.previousExperience,
                agreementAccepted: dto.agreementAccepted,
                status: 'PENDING',
            },
            include: {
                animal: {
                    select: {
                        id: true,
                        name: true,
                        photos: true,
                    },
                },
                shelter: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true,
                    },
                },
            },
        });

        // Обновляем статус животного на "reserved" (через обновление статуса заявки)
        // Не меняем isAdopted до подтверждения

        // Отправляем email приюту о новой заявке
        try {
            const shelter = await this.prisma.shelter.findUnique({
                where: { id: shelterId },
                include: { 
                    owner: { select: { email: true, name: true, lastName: true } },
                    animals: { where: { id: animalId }, select: { name: true } },
                },
            });

            if (shelter?.owner?.email) {
                const user = await this.prisma.user.findUnique({
                    where: { id: userId },
                    select: { name: true, lastName: true, phone: true, email: true },
                });

                // В development режиме мокаем отправку email
                if (isDevelopment()) {
                    this.logger.log(
                        `[DEV MODE] Adoption request email would be sent to: ${shelter.owner.email}`,
                    );
                    this.logger.log(
                        `[DEV MODE] Shelter: ${shelter.name}, Animal: ${shelter.animals[0]?.name || 'животное'}`,
                    );
                    this.logger.log(
                        `[DEV MODE] User: ${user?.name || ''} ${user?.lastName || ''}, Request ID: ${adoptionRequest.id}`,
                    );
                } else {
                    // Отправляем email в production
                    try {
                        await this.mailerService.sendMail({
                            to: shelter.owner.email,
                            subject: 'Новая заявка на усыновление - Pet Care',
                            template: 'adoption-request', // Нужно создать шаблон
                            context: {
                                shelterName: shelter.name,
                                animalName: shelter.animals[0]?.name || 'животное',
                                userName: `${user?.name || ''} ${user?.lastName || ''}`.trim(),
                                userPhone: user?.phone || 'не указан',
                                userEmail: user?.email || 'не указан',
                                message: dto.adoptionReason || 'Сообщение не указано',
                                adoptionRequestId: adoptionRequest.id,
                            },
                        });
                        this.logger.log(`Adoption request email sent to: ${shelter.owner.email}`);
                    } catch (error) {
                        // Логируем ошибку, но не прерываем процесс
                        this.logger.error('Failed to send adoption request email:', error);
                    }
                }
            }
        } catch (error) {
            // Логируем ошибку, но не прерываем процесс
            this.logger.error('Failed to process adoption request email:', error);
        }

        // Создаем уведомление для пользователя
        try {
            await this.prisma.notification.create({
                data: {
                    userId: userId,
                    name: 'Заявка на усыновление отправлена',
                    description: `Ваша заявка на усыновление животного из приюта "${shelter?.name || 'Неизвестный приют'}" успешно отправлена.`,
                    type: 'HIGH',
                    isCompleted: false,
                    isConfirmed: false,
                },
            });
        } catch (error) {
            console.error('Failed to create adoption notification:', error);
        }

        return {
            id: adoptionRequest.id,
            shelterId: adoptionRequest.shelterId,
            animalId: adoptionRequest.animalId,
            userId: adoptionRequest.userId,
            status: adoptionRequest.status,
            contactPhone: adoptionRequest.contactPhone,
            createdAt: adoptionRequest.createdAt,
            message: 'Заявка на усыновление отправлена. С вами свяжутся в ближайшее время.',
        };
    }

    /**
     * Создание пожертвования приюту
     */
    async createDonation(
        userId: number | null,
        shelterId: number,
        dto: CreateDonationDto
    ) {
        // Проверяем существование приюта
        const shelter = await this.prisma.shelter.findUnique({
            where: { id: shelterId },
        });

        if (!shelter || !shelter.isActive) {
            throw new NotFoundException('Shelter not found');
        }

        // Генерируем ID платежной сессии
        const paymentSessionId = `session_${randomBytes(16).toString('hex')}`;

        // Создаем запись о пожертвовании
        const donation = await this.prisma.donation.create({
            data: {
                shelterId,
                userId: userId || null,
                amount: dto.amount,
                currency: dto.currency || 'RUB',
                message: dto.message,
                anonymous: dto.anonymous || false,
                recurring: dto.recurring || false,
                status: 'PENDING',
                paymentSessionId,
            },
            include: {
                shelter: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return {
            id: donation.id,
            shelterId: donation.shelterId,
            amount: donation.amount,
            currency: donation.currency,
            status: donation.status,
            paymentSessionId: donation.paymentSessionId,
            createdAt: donation.createdAt,
        };
    }
}