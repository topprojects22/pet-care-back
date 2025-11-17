import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation } from '@nestjs/swagger';

/**
 * Декоратор для Swagger документации ошибок "не найдено" (404 Not Found)
 * 
 * @example
 * @Get(':id')
 * @ApiNotFound('Resource not found')
 * async findOne(@Param('id') id: number) {
 *   return this.service.findOne(id);
 * }
 */
export const ApiNotFound = (description = 'Resource not found') => {
  return applyDecorators(
    ApiOperation({ summary: description }),
    ApiNotFoundResponse({
      description,
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Resource not found' },
          error: { type: 'string', example: 'Not Found' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    }),
  );
};

