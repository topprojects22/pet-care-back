import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse as SwaggerApiOkResponse, getSchemaPath, ApiExtraModels } from '@nestjs/swagger';

/**
 * Декоратор для Swagger документации успешного ответа (200 OK)
 * 
 * @example
 * @Get(':id')
 * @ApiOkResponseModel(UserDto)
 * async findOne(@Param('id') id: number) {
 *   return this.service.findOne(id);
 * }
 */
export const ApiOkResponseModel = <TModel extends Type<unknown>>(
  model: TModel,
  description = 'Success',
) => {
  return applyDecorators(
    ApiExtraModels(model),
    SwaggerApiOkResponse({
      description,
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            $ref: getSchemaPath(model),
          },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    }),
  );
};

