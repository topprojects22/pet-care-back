import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Декоратор для добавления примеров использования API
 * 
 * @example
 * @ApiExamples({
 *   summary: 'Get user pets',
 *   description: 'Returns all pets for the authenticated user',
 *   successExample: { data: [{ id: 1, name: 'Fluffy' }] },
 *   errorExample: { statusCode: 401, message: 'Unauthorized' }
 * })
 */
export const ApiExamples = (options: {
  summary: string;
  description?: string;
  successExample?: unknown;
  errorExample?: unknown;
}) => {
  const decorators = [
    ApiOperation({
      summary: options.summary,
      description: options.description,
    }),
  ];

  if (options.successExample) {
    decorators.push(
      ApiResponse({
        status: 200,
        description: 'Success',
        schema: {
          example: options.successExample,
        },
      }),
    );
  }

  if (options.errorExample) {
    decorators.push(
      ApiResponse({
        status: 400,
        description: 'Error',
        schema: {
          example: options.errorExample,
        },
      }),
    );
  }

  return applyDecorators(...decorators);
};

