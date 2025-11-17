import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation } from '@nestjs/swagger';

/**
 * Декоратор для Swagger документации ошибок валидации (400 Bad Request)
 * 
 * @example
 * @Post()
 * @ApiBadRequest('Invalid input data')
 * async create(@Body() data: CreateDto) {
 *   return this.service.create(data);
 * }
 */
export const ApiBadRequest = (description = 'Invalid input data') => {
  return applyDecorators(
    ApiOperation({ summary: description }),
    ApiBadRequestResponse({
      description,
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: {
            type: 'array',
            items: { type: 'string' },
            example: ['email must be an email', 'password must be longer than 8 characters'],
          },
          error: { type: 'string', example: 'Bad Request' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    }),
  );
};

