import { IsString, IsEnum, IsObject, IsOptional, IsBoolean } from 'class-validator';

export class ProcessPaymentDto {
  @IsString()
  @IsEnum(['card', 'apple_pay', 'google_pay', 'stripe'])
  paymentMethod: 'card' | 'apple_pay' | 'google_pay' | 'stripe';

  @IsObject()
  @IsOptional()
  paymentData?: {
    cardToken?: string;
    saveCard?: boolean;
    [key: string]: any;
  };
}

