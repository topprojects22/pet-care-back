import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsEnum,
  Min,
  Max,
  IsBoolean,
} from "class-validator";
import { NotificationType } from "@prisma/client";
// create-notification.dto.ts
export class CreateNotificationDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsOptional()
  @IsNumber()
  petId?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @IsDate()
  @IsNotEmpty()
  date: Date;

  @IsOptional()
  @IsDate()
  expiriedAt?: Date;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  repeatPattern?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  priority?: number;
}

// update-notification.dto.ts
export class UpdateNotificationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsDate()
  date?: Date;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  repeatPattern?: string;
}
