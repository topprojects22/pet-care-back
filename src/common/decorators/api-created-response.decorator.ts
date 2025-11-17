import { applyDecorators, Type } from '@nestjs/common';
import { ApiCreatedResponse as SwaggerApiCreatedResponse, getSchemaPath, ApiExtraModels } from '@nestjs/swagger';

/**
 * Декоратор для Swagger документации успешного создания ресурса
 * 
 * @example
 * @Post()
 * @ApiCreatedResponseModel(UserDto)
 * async create(@Body() data: CreateUserDto) {
 *   return this.service.create(data);
 * }
 */
export const ApiCreatedResponseModel = <TModel extends Type<unknown>>(
  model: TModel,
  description = 'Resource created successfully',
) => {
  return applyDecorators(
    ApiExtraModels(model),
    SwaggerApiCreatedResponse({
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

