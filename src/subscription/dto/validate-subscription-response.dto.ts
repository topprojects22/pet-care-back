import { ApiProperty } from '@nestjs/swagger';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  IN_GRACE_PERIOD = 'inGracePeriod',
  IN_BILLING_RETRY = 'inBillingRetry',
  REVOKED = 'revoked',
  INVALID = 'invalid',
}

export class ValidateSubscriptionResponseDto {
  @ApiProperty({
    description: 'Whether the receipt is valid',
    example: true,
  })
  isValid!: boolean;

  @ApiProperty({
    description: 'Current subscription status',
    enum: SubscriptionStatus,
    example: SubscriptionStatus.ACTIVE,
  })
  subscriptionStatus!: SubscriptionStatus;

  @ApiProperty({
    description: 'Subscription expiration date in ISO 8601 format',
    example: '2025-12-31T23:59:59Z',
    nullable: true,
  })
  expiresAt!: string | null;

  @ApiProperty({
    description: 'Product ID of the subscription',
    example: 'pro_monthly',
    nullable: true,
  })
  productId!: string | null;

  @ApiProperty({
    description: 'Human-readable message about the subscription status',
    example: 'Subscription is active',
  })
  message!: string;
}

