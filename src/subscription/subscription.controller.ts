import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { ValidateSubscriptionDto } from './dto/validate-subscription.dto';
import { ValidateSubscriptionResponseDto } from './dto/validate-subscription-response.dto';
import { Auth } from '../auth/decorators/auth.decorator';

@ApiTags('Subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('validate')
  @Auth()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: 'Validate Apple subscription receipt',
    description:
      'Validates a StoreKit 2 JWS receipt with Apple App Store Server API and returns subscription status',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Receipt validated successfully',
    type: ValidateSubscriptionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid receipt data or validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  async validate(
    @Body() dto: ValidateSubscriptionDto,
  ): Promise<ValidateSubscriptionResponseDto> {
    return this.subscriptionService.validateReceipt(dto);
  }
}

