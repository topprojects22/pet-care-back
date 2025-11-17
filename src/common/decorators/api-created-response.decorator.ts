import { applyDecorators, Type } from '@nestjs/common';
import { ApiCreatedResponse, getSchemaPath, ApiExtraModels } from '@nestjs/swagger';

/**
 * Декоратор для Swagger документации успешного создания ресурса
 * 
 * @example
 * @Post()
 * @ApiCreatedResponse(UserDto)
 * async create(@Body() data: CreateUserDto) {
 *   return this.service.create(data);
 * }
 */
export const ApiCreatedResponse = <TModel extends Type<unknown>>(
  model: TModel,
  description = 'Resource created successfully',
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiCreatedResponse({
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

