import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma.service';

/**
 * Guard для проверки владения ресурсом
 * Используется для защиты ресурсов от несанкционированного доступа
 * 
 * @example
 * @UseGuards(OwnershipGuard)
 * @SetMetadata('resource', 'pet')
 * @Get(':id')
 */
@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resource = this.reflector.get<string>(
      'resource',
      context.getHandler(),
    );

    if (!resource) {
      return true; // Если ресурс не указан, пропускаем
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Поддержка различных форматов параметров: id, petId, userId и т.д.
    const resourceId = 
      request.params.id || 
      request.params[`${resource}Id`] ||
      request.params[`${resource.toLowerCase()}Id`];

    if (!user || !resourceId) {
      throw new ForbiddenException('Access denied');
    }

    // Проверяем владение ресурсом
    const isOwner = await this.checkOwnership(resource, +resourceId, user.id);

    if (!isOwner) {
      throw new ForbiddenException('You do not have access to this resource');
    }

    return true;
  }

  private async checkOwnership(
    resource: string,
    resourceId: number,
    userId: number,
  ): Promise<boolean> {
    try {
      switch (resource.toLowerCase()) {
        case 'pet': {
          const pet = await this.prisma.pet.findUnique({
            where: { id: resourceId },
            select: { userId: true },
          });
          if (!pet) {
            throw new NotFoundException('Pet not found');
          }
          return pet.userId === userId;
        }

        case 'notification': {
          const notification = await this.prisma.notification.findUnique({
            where: { id: resourceId },
            select: { userId: true },
          });
          if (!notification) {
            throw new NotFoundException('Notification not found');
          }
          return notification.userId === userId;
        }

        case 'payment': {
          const payment = await this.prisma.payment.findUnique({
            where: { id: resourceId },
            select: { userId: true },
          });
          if (!payment) {
            throw new NotFoundException('Payment not found');
          }
          return payment.userId === userId;
        }

        case 'shelter': {
          const shelter = await this.prisma.shelter.findUnique({
            where: { id: resourceId },
            select: { ownerId: true },
          });
          if (!shelter) {
            throw new NotFoundException('Shelter not found');
          }
          return shelter.ownerId === userId;
        }

        case 'user': {
          // Для user просто проверяем, что id совпадает
          return resourceId === userId;
        }

        case 'petphoto': {
          // Для petPhoto получаем petId из фото и проверяем владение питомцем
          const photo = await this.prisma.petPhoto.findUnique({
            where: { id: resourceId },
            select: { petId: true },
          });
          if (!photo) {
            throw new NotFoundException('Photo not found');
          }
          // Рекурсивно проверяем владение питомцем
          return this.checkOwnership('pet', photo.petId, userId);
        }

        case 'vetvisit': {
          // Для vetVisit получаем petId из визита и проверяем владение питомцем
          const visit = await this.prisma.admissionVetClinic.findUnique({
            where: { id: resourceId },
            select: { petId: true },
          });
          if (!visit) {
            throw new NotFoundException('Vet visit not found');
          }
          // Рекурсивно проверяем владение питомцем
          return this.checkOwnership('pet', visit.petId, userId);
        }

        case 'vaccination': {
          // Для vaccination получаем petId из вакцинации и проверяем владение питомцем
          const vaccination = await this.prisma.vaccination.findUnique({
            where: { id: resourceId },
            select: { petId: true },
          });
          if (!vaccination) {
            throw new NotFoundException('Vaccination not found');
          }
          // Рекурсивно проверяем владение питомцем
          return this.checkOwnership('pet', vaccination.petId, userId);
        }

        default:
          return false;
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return false;
    }
  }
}

