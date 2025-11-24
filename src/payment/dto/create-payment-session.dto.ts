import { IsNumber, IsString, IsOptional, IsObject, Min } from 'class-validator';

export class CreatePaymentSessionDto {
  @IsNumber()
  @IsOptional()
  serviceId?: number;

  @IsString()
  @IsOptional()
  orderId?: string;

  @IsString()
  @IsNotEmpty()
  serviceType: 'veterinary' | 'grooming' | 'boarding' | 'charity' | 'subscription';

  @IsObject()
  @IsOptional()
  metadata?: {
    petId?: number;
    clinicId?: number;
    appointmentDate?: string;
    [key: string]: any;
  };
}

