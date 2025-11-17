import { applyDecorators } from '@nestjs/common';
import { ApiNoContentResponse as SwaggerApiNoContentResponse, ApiOperation } from '@nestjs/swagger';

/**
 * Декоратор для Swagger документации успешного удаления (204 No Content)
 * 
 * @example
 * @Delete(':id')
 * @HttpCode(HttpStatus.NO_CONTENT)
 * @ApiNoContent('Resource deleted successfully')
 * async delete(@Param('id') id: number) {
 *   await this.service.delete(id);
 * }
 */
export const ApiNoContent = (description = 'Operation completed successfully') => {
  return applyDecorators(
    ApiOperation({ summary: description }),
    SwaggerApiNoContentResponse({ description }),
  );
};

