import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath, ApiExtraModels } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../dto/pagination.dto';

/**
 * Декоратор для Swagger документации пагинированных ответов
 * 
 * @example
 * @Get()
 * @ApiPaginatedResponse(PetDto)
 * async findAll(@Query() pagination: PaginationDto) {
 *   return this.service.findAll(pagination);
 * }
 */
export const ApiPaginatedResponse = <TModel extends Type<unknown>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(PaginatedResponseDto, model),
    ApiOkResponse({
      description: 'Paginated response',
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
};

