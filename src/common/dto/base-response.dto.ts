import { ApiProperty } from '@nestjs/swagger';

/**
 * Базовый DTO для стандартизированных ответов API
 */
export class BaseResponseDto<T = unknown> {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty()
  data!: T;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timestamp!: string;
}

/**
 * DTO для ответов с ошибками
 */
export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ example: 'Bad Request' })
  message!: string;

  @ApiProperty({ example: 'Validation failed' })
  error!: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ required: false })
  details?: unknown;
}

