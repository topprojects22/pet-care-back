// src/event-participation/event-participation.module.ts
import { Module } from '@nestjs/common';
import { EventParticipationController } from './event-participation.controller';
import { EventParticipationService } from './event-participation.service';
import { PrismaService } from '../prisma.service';
import { CommunityPostModule } from '../community-post/community-post.module';

@Module({
    imports: [CommunityPostModule],
    controllers: [EventParticipationController],
    providers: [EventParticipationService, PrismaService],
    exports: [EventParticipationService],
})
export class EventParticipationModule {}