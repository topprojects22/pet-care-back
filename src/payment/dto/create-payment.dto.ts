// src/payment/dto/create-payment.dto.ts
import { IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
    @IsNumber()
    amount!: number; // сумма в минимальных единицах (копейки/центы) или в валюте — по соглашению

    @IsEnum(PaymentMethod)
    method!: PaymentMethod; // CARD, CASH, ONLINE и т.д.

    @IsNumber()
    @IsOptional()
    serviceId?: number; // если оплата за услугу клиники

    @IsString()
    @IsOptional()
    invoiceNumber?: string; // можно сгенерировать автоматически
}