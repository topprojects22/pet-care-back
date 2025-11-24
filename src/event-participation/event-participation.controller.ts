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
} from '@nestjs/common';
import { EventParticipationService } from './event-participation.service';
import { CommunityPostService } from '../community-post/community-post.service';
import { CreateEventParticipationDto } from './dto/create-event-participation.dto';
import { UpdateEventParticipationDto } from './dto/update-event-participation.dto';
import { Auth } from "../auth/decorators/auth.decorator";
import { CurrentUser } from '../common/decorators/user.decorator';
import { User } from '@prisma/client';

@Controller('events')
export class EventParticipationController {
    constructor(
        private readonly participationService: EventParticipationService,
        private readonly communityPostService: CommunityPostService,
    ) {}

    /**
     * GET /api/events
     * Получает каталог событий (посты с типом EVENT)
     */
    @Get()
    async getEvents(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('location') location?: string,
        @CurrentUser() user?: User,
    ) {
        return this.communityPostService.findAll({
            type: 'EVENT',
            page: page ? +page : undefined,
            limit: limit ? +limit : undefined,
            userId: user?.id,
        });
    }

    /**
     * POST /api/events/:id/register
     * Алиас для регистрации на событие (соответствует спецификации)
     */
    @Post(':id/register')
    @Auth()
    register(
        @Param('id') id: string,
        @Body() dto: CreateEventParticipationDto,
        @CurrentUser() user: User,
    ) {
        return this.participationService.createParticipation(user.id, {
            ...dto,
            postId: +id,
        });
    }

    // Записаться на событие (оригинальный эндпоинт для обратной совместимости)
    @Post(':postId/participate')
    @Auth()
    participate(
        @Param('postId') postId: string,
        @Body() dto: CreateEventParticipationDto,
        @CurrentUser() user: User,
    ) {
        return this.participationService.createParticipation(user.id, {
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
        @CurrentUser() user: User,
        @Query('petId') petId?: string,
    ) {
        return this.participationService.findOne(+postId, user.id, petId ? +petId : undefined);
    }

    // Обновить участие (например, отменить)
    @Patch(':postId/my-participation')
    @Auth()
    updateMyParticipation(
        @Param('postId') postId: string,
        @Body() dto: UpdateEventParticipationDto,
        @CurrentUser() user: User,
        @Query('petId') petId?: string,
    ) {
        return this.participationService.updateParticipation(
            user.id,
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
        @CurrentUser() user: User,
        @Query('petId') petId?: string,
    ) {
        return this.participationService.removeParticipation(
            user.id,
            +postId,
            petId ? +petId : undefined,
        );
    }

    // Только для организатора: кто участвует в моём событии?
    @Get(':postId/participants/mine')
    @Auth()
    getMyEventParticipants(@Param('postId') postId: string, @CurrentUser() user: User) {
        return this.participationService.getParticipantsForUserEvent(user.id, +postId);
    }
}