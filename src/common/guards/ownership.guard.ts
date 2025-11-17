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
    const resourceId = request.params.id || request.params[`${resource}Id`];

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

