import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

/**
 * Декоратор для Swagger документации параметра поиска
 * 
 * @example
 * @Get()
 * @ApiQuerySearch()
 * async search(@Query('search') search: string) {
 *   return this.service.search(search);
 * }
 */
export const ApiQuerySearch = () => {
  return applyDecorators(
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description: 'Search query',
      example: 'search term',
    }),
  );
};

