// src/staff-member/dto/create-staff-member.dto.ts
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateStaffMemberDto {
    @IsString()
    name!: string; // Полное имя: "Иванова Мария Петровна"

    @IsString()
    position!: string; // "Ветеринарный врач", "Администратор"

    @IsString()
    @IsOptional()
    specialty?: string; // "Хирургия", "Дерматология", "Офтальмология"

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean; // по умолчанию true
}