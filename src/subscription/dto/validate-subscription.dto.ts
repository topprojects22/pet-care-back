import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateSubscriptionDto {
  @ApiProperty({
    description: 'Base64 encoded JWS receipt data from StoreKit 2',
    example: 'eyJhbGciOiJSUzI1NiIsIng1YyI6WyJNSUlCUERDQ...',
  })
  @IsString()
  @IsNotEmpty()
  receipt_data: string;
}

