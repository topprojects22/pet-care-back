import { SetMetadata } from '@nestjs/common';

export const RESOURCE_KEY = 'resource';

/**
 * Декоратор для указания типа ресурса для проверки владения
 * 
 * @param resource - тип ресурса (pet, notification, payment, shelter и т.д.)
 * 
 * @example
 * @Get(':id')
 * @Resource('pet')
 * @UseGuards(OwnershipGuard)
 * async getPet(@Param('id') id: string) {
 *   return this.petService.findOne(+id);
 * }
 */
export const Resource = (resource: string) => SetMetadata(RESOURCE_KEY, resource);

