import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';

/**
 * Декоратор для стандартизации Swagger ответов
 * 
 * @example
 * @ApiStandardResponse(UserDto)
 * @Get(':id')
 */
export const ApiStandardResponse = <TModel extends Type<unknown>>(
  model: TModel,
  status = 200,
  description = 'Success',
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status,
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

/**
 * Декоратор для пагинированных ответов
 */
export const ApiPaginatedResponse = <TModel extends Type<unknown>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status: 200,
      description: 'Paginated response',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              meta: {
                type: 'object',
                properties: {
                  page: { type: 'number' },
                  limit: { type: 'number' },
                  total: { type: 'number' },
                  totalPages: { type: 'number' },
                },
              },
            },
          },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    }),
  );
};

