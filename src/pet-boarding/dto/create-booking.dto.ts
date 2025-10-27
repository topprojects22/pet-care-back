// src/pet-boarding/dto/create-booking.dto.ts
import { IsNumber, IsDate, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
    @IsNumber()
    petId: number;

    @Type(() => Date)
    @IsDate()
    startDate: Date;

    @Type(() => Date)
    @IsDate()
    endDate: Date;

    @IsString()
    @IsOptional()
    specialRequests?: string; // "аллергия на курицу", "боится кошек"
}