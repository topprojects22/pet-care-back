// src/event-participation/event-participation.controller.ts
import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import { EventParticipationService } from './event-participation.service';
import { CreateEventParticipationDto } from './dto/create-event-participation.dto';
import { UpdateEventParticipationDto } from './dto/update-event-participation.dto';
import {Auth} from "../auth/decorators/auth.decorator";

@Controller('events')
export class EventParticipationController {
    constructor(private readonly participationService: EventParticipationService) {}

    // Записаться на событие
    @Post(':postId/participate')
    @Auth()
    participate(
        @Param('postId') postId: string,
        @Body() dto: CreateEventParticipationDto,
        @Req() req,
    ) {
        return this.participationService.createParticipation(req.user.id, {
            ...dto,
            postId: +postId,
        });
    }

    // Список участников события
    @Get(':postId/participants')
    getParticipants(@Param('postId') postId: string) {
        return this.participationService.findAllForEvent(+postId);
    }

    // Моё участие (если petId не указан — вернёт любое)
    @Get(':postId/my-participation')
    @Auth()
    getMyParticipation(
        @Param('postId') postId: string,
        @Req() req,
        @Query('petId') petId?: string,
    ) {
        return this.participationService.findOne(+postId, req.user.id, petId ? +petId : undefined);
    }

    // Обновить участие (например, отменить)
    @Patch(':postId/my-participation')
    @Auth()
    updateMyParticipation(
        @Param('postId') postId: string,
        @Body() dto: UpdateEventParticipationDto,
        @Req() req,
        @Query('petId') petId?: string,
    ) {
        return this.participationService.updateParticipation(
            req.user.id,
            +postId,
            dto,
            petId ? +petId : undefined,
        );
    }

    // Отменить участие
    @Delete(':postId/my-participation')
    @Auth()
    removeMyParticipation(
        @Param('postId') postId: string,
        @Req() req,
        @Query('petId') petId?: string,
    ) {
        return this.participationService.removeParticipation(
            req.user.id,
            +postId,
            petId ? +petId : undefined,
        );
    }

    // Только для организатора: кто участвует в моём событии?
    @Get(':postId/participants/mine')
    @Auth()
    getMyEventParticipants(@Param('postId') postId: string, @Req() req) {
        return this.participationService.getParticipantsForUserEvent(req.user.id, +postId);
    }
}