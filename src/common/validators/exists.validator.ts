import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { PrismaService } from '../../prisma.service';

/**
 * Валидатор для проверки существования записи в базе данных
 * 
 * @example
 * class CreatePetDto {
 *   @Exists('user', 'id')
 *   userId: number;
 * }
 */
export function Exists(
  model: string,
  field: string = 'id',
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'exists',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [model, field],
      options: {
        ...validationOptions,
        message: `${model} with this ${field} does not exist`,
      },
      validator: {
        async validate(value: unknown, args: ValidationArguments) {
          if (!value) return false;

          const [modelName, fieldName] = args.constraints;
          const prismaService = (args.object as { prisma?: PrismaService }).prisma;

          if (!prismaService) {
            return false;
          }

          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await (prismaService as any)[modelName].findUnique({
              where: { [fieldName]: value },
            });

            return !!result; // Возвращаем true, если запись найдена
          } catch {
            return false;
          }
        },
      },
    });
  };
}

