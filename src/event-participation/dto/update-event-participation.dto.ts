// src/event-participation/dto/update-event-participation.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateEventParticipationDto } from './create-event-participation.dto';

export class UpdateEventParticipationDto extends PartialType(CreateEventParticipationDto) {
    // разрешаем менять только статус и petId
}