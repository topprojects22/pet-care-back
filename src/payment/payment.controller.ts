// src/payment/payment.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Query,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreatePaymentSessionDto } from './dto/create-payment-session.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { GetPaymentsQueryDto } from './dto/get-payments-query.dto';
import { Auth } from "../auth/decorators/auth.decorator";
import { CurrentUser } from '../common/decorators/user.decorator';
import { User } from '@prisma/client';

@Controller('payments')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @Post()
    @Auth()
    create(@Body() dto: CreatePaymentDto, @CurrentUser() user: User) {
        return this.paymentService.createPayment(user.id, dto);
    }

    @Get()
    @Auth()
    findAll(
        @CurrentUser() user: User,
        @Query('status') status?: string,
    ) {
        return this.paymentService.findAllForUser(user.id, status);
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

    @Post('session')
    @Auth()
    createSession(@Body() dto: CreatePaymentSessionDto, @CurrentUser() user: User) {
        return this.paymentService.createPaymentSession(user.id, dto);
    }

    @Post('session/:sessionId/process')
    @Auth()
    processPayment(
        @Param('sessionId') sessionId: string,
        @Body() dto: ProcessPaymentDto,
        @CurrentUser() user: User,
    ) {
        return this.paymentService.processPayment(sessionId, user.id, dto);
    }

    @Get('transactions')
    @Auth()
    getTransactions(
        @CurrentUser() user: User,
        @Query() query: GetPaymentsQueryDto,
    ) {
        return this.paymentService.getTransactions(
            user.id,
            query,
        );
    }
}