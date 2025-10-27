// src/payment/dto/update-payment-status.dto.ts
import { IsEnum } from 'class-validator';
import { PaymentStatus } from '@prisma/client';

export class UpdatePaymentStatusDto {
    @IsEnum(PaymentStatus)
    status: PaymentStatus;
}