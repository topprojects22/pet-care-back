import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { PASSWORD_PATTERN } from '../constants';

/**
 * Валидатор для проверки сложности пароля
 * Требует: минимум 8 символов, заглавные и строчные буквы, цифры, спецсимволы
 * 
 * @example
 * class RegisterDto {
 *   @IsStrongPassword()
 *   password: string;
 * }
 */
export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        ...validationOptions,
        message:
          'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character',
      },
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }
          return PASSWORD_PATTERN.test(value);
        },
      },
    });
  };
}

