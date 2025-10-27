// src/notification/dto/update-notification.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateNotificationDto } from './create-notification.dto';
import { IsBoolean } from 'class-validator';

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
    // разрешаем обновлять только статус и подтверждение
    @IsBoolean()
    isCompleted?: boolean;
}