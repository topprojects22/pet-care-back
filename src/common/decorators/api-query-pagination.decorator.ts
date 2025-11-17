import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

/**
 * Декоратор для Swagger документации параметров пагинации
 * 
 * @example
 * @Get()
 * @ApiQueryPagination()
 * async findAll(@Query() pagination: PaginationDto) {
 *   return this.service.findAll(pagination);
 * }
 */
export const ApiQueryPagination = () => {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (starts from 1)',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of items per page',
      example: 10,
    }),
  );
};

