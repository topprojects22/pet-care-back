import { applyDecorators } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation } from '@nestjs/swagger';

/**
 * Декоратор для Swagger документации ошибок доступа (403 Forbidden)
 * 
 * @example
 * @Delete(':id')
 * @Auth()
 * @Resource('pet')
 * @UseGuards(OwnershipGuard)
 * @ApiForbidden('Access denied to this resource')
 * async delete(@Param('id') id: number) {
 *   await this.service.delete(id);
 * }
 */
export const ApiForbidden = (description = 'Access denied') => {
  return applyDecorators(
    ApiOperation({ summary: description }),
    ApiForbiddenResponse({
      description,
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 403 },
          message: { type: 'string', example: 'Access denied' },
          error: { type: 'string', example: 'Forbidden' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    }),
  );
};

