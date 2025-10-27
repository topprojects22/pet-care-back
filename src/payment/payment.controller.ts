// src/payment/payment.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    UseGuards,
    Req,
    Query,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import {Auth} from "../auth/decorators/auth.decorator";

@Controller('payments')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @Post()
    @Auth()
    create(@Body() dto: CreatePaymentDto, @Req() req) {
        return this.paymentService.createPayment(req.user.id, dto);
    }

    @Get()
    @Auth()
    findAll(
        @Req() req,
        @Query('status') status?: string,
    ) {
        return this.paymentService.findAllForUser(req.user.id, status);
    }

    @Get(':id')
    @Auth()
    findOne(@Param('id') id: string) {
        return this.paymentService.findOne(+id);
    }

    // Только для админа или вебхуков — защищено отдельно в продакшене
    @Patch(':id/status')
    @Auth()// ← в реальности: Guard для админа или API-ключа
    updateStatus(@Param('id') id: string, @Body() dto: UpdatePaymentStatusDto) {
        return this.paymentService.updatePaymentStatus(+id, dto);
    }
}