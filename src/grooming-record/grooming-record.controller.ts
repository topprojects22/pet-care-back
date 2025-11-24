// src/grooming-record/grooming-record.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    Query,
} from '@nestjs/common';
import { GroomingRecordService } from './grooming-record.service';
import { CreateGroomingRecordDto } from './dto/create-grooming-record.dto';
import { UpdateGroomingRecordDto } from './dto/update-grooming-record.dto';
import { Auth } from "../auth/decorators/auth.decorator";
import { CurrentUser } from "../common/decorators/user.decorator";
import { User } from "@prisma/client";

@Controller('pets/:petId/grooming')
export class GroomingRecordController {
    constructor(private readonly groomingService: GroomingRecordService) {}

    @Post()
    @Auth()
    create(
        @Param('petId') petId: string,
        @Body() dto: CreateGroomingRecordDto,
        @CurrentUser() user: User,
    ) {
        return this.groomingService.createRecord(user.id, +petId, dto);
    }

    @Get()
    findAll(
        @Param('petId') petId: string,
        @Query('future') future?: string,
    ) {
        return this.groomingService.findAllForPet(+petId, future === 'true');
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.groomingService.findOne(+id);
    }

    @Patch(':id')
    @Auth()
    update(
        @Param('id') id: string,
        @Body() dto: UpdateGroomingRecordDto,
        @CurrentUser() user: User,
    ) {
        return this.groomingService.updateRecord(user.id, +id, dto);
    }

    @Delete(':id')
    @Auth()
    remove(@Param('id') id: string, @CurrentUser() user: User) {
        return this.groomingService.removeRecord(user.id, +id);
    }
}