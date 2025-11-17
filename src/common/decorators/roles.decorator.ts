import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Декоратор для указания требуемых ролей для доступа к endpoint
 * 
 * @example
 * @Roles('admin', 'vet')
 * @UseGuards(RolesGuard)
 * @Get('admin-only')
 * async adminOnly() {
 *   return { message: 'Admin access' };
 * }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

