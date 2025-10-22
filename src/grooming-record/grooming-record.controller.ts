// src/grooming-record/grooming-record.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    UseGuards,
    Req,
    Query,
} from '@nestjs/common';
import { GroomingRecordService } from './grooming-record.service';
import { CreateGroomingRecordDto } from './dto/create-grooming-record.dto';
import { UpdateGroomingRecordDto } from './dto/update-grooming-record.dto';
import {Auth} from "../auth/decorators/auth.decorator";

@Controller('pets/:petId/grooming')
export class GroomingRecordController {
    constructor(private readonly groomingService: GroomingRecordService) {}

    @Post()
    @Auth()
    create(
        @Param('petId') petId: string,
        @Body() dto: CreateGroomingRecordDto,
        @Req() req,
    ) {
        return this.groomingService.createRecord(req.user.id, +petId, dto);
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
        @Req() req,
    ) {
        return this.groomingService.updateRecord(req.user.id, +id, dto);
    }

    @Delete(':id')
    @Auth()
    remove(@Param('id') id: string, @Req() req) {
        return this.groomingService.removeRecord(req.user.id, +id);
    }
}