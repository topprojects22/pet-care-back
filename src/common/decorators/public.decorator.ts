import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Декоратор для пометки публичных endpoints (без аутентификации)
 * 
 * @example
 * @Public()
 * @Get('public')
 * async getPublicData() {
 *   return { message: 'This is public' };
 * }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

