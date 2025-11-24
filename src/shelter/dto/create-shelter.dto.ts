// src/shelter/dto/create-shelter.dto.ts
import { IsString, IsOptional, IsUrl, IsPhoneNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateShelterDto {
    @IsString()
    name!: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    address!: string;

    @IsPhoneNumber('RU') // или общий формат
    phone!: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsUrl()
    @IsOptional()
    website?: string;

    @IsString()
    @IsOptional()
    geoCoordinates?: string; // "lat,lng"

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    photos?: string[]; // URLs

    // ownerId будет браться из JWT, а не из DTO!
}