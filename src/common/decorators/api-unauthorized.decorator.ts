import { applyDecorators } from '@nestjs/common';
import { ApiUnauthorizedResponse, ApiOperation } from '@nestjs/swagger';

/**
 * Декоратор для Swagger документации ошибок аутентификации (401 Unauthorized)
 * 
 * @example
 * @Get('profile')
 * @Auth()
 * @ApiUnauthorized('Invalid or missing token')
 * async getProfile() {
 *   return this.service.getProfile();
 * }
 */
export const ApiUnauthorized = (description = 'Invalid or missing authentication token') => {
  return applyDecorators(
    ApiOperation({ summary: description }),
    ApiUnauthorizedResponse({
      description,
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 401 },
          message: { type: 'string', example: 'Unauthorized' },
          error: { type: 'string', example: 'Unauthorized' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    }),
  );
};

