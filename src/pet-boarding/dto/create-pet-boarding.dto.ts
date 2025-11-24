// src/pet-boarding/dto/create-pet-boarding.dto.ts
import { IsString, IsNumber, IsBoolean, IsArray, IsOptional } from 'class-validator';

export class CreatePetBoardingDto {
    @IsString()
    name!: string; // "Уютный дом для собак"

    @IsString()
    description!: string;

    @IsString()
    address!: string;

    @IsString()
    phone!: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    website?: string;

    @IsString()
    @IsOptional()
    geoCoordinates?: string; // "55.7558,37.6176"

    @IsArray()
    @IsString({ each: true })
    photos!: string[];

    @IsNumber()
    pricePerDay!: number;

    @IsNumber()
    capacity!: number; // макс. количество животных

    @IsNumber()
    availableSpots!: number; // свободные места

    @IsArray()
    @IsString({ each: true })
    amenities!: string[]; // ["вольер", "игровая площадка", "камеры"]

    @IsArray()
    @IsString({ each: true })
    rules!: string[]; // ["только привитые", "без агрессии"]

    @IsString()
    checkInTime!: string; // "10:00"

    @IsString()
    checkOutTime!: string; // "18:00"
}