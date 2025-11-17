import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

/**
 * Декоратор для Swagger документации параметров сортировки
 * 
 * @example
 * @Get()
 * @ApiQuerySort()
 * async findAll(
 *   @Query('sortBy') sortBy: string,
 *   @Query('sortOrder') sortOrder: 'asc' | 'desc'
 * ) {
 *   return this.service.findAll({ sortBy, sortOrder });
 * }
 */
export const ApiQuerySort = () => {
  return applyDecorators(
    ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      description: 'Field to sort by',
      example: 'createdAt',
    }),
    ApiQuery({
      name: 'sortOrder',
      required: false,
      enum: ['asc', 'desc'],
      description: 'Sort order',
      example: 'desc',
    }),
  );
};

