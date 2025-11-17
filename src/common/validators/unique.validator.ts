import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { PrismaService } from '../../prisma.service';

/**
 * Валидатор для проверки уникальности значения в базе данных
 * 
 * @example
 * class CreateUserDto {
 *   @IsUnique('user', 'email')
 *   email: string;
 * }
 */
export function IsUnique(
  model: string,
  field: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isUnique',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [model, field],
      options: {
        ...validationOptions,
        message: `${field} must be unique`,
      },
      validator: {
        async validate(value: unknown, args: ValidationArguments) {
          if (!value) return true; // Если значение пустое, пропускаем (используйте @IsNotEmpty отдельно)

          const [modelName, fieldName] = args.constraints;
          const prismaService = args.object['prisma'] as PrismaService;

          if (!prismaService) {
            return false;
          }

          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await (prismaService as any)[modelName].findUnique({
              where: { [fieldName]: value },
            });

            return !result; // Возвращаем true, если запись не найдена (уникальна)
          } catch {
            return false;
          }
        },
      },
    });
  };
}

