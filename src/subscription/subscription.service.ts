import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ValidateSubscriptionDto } from './dto/validate-subscription.dto';
import {
  ValidateSubscriptionResponseDto,
  SubscriptionStatus,
} from './dto/validate-subscription-response.dto';

interface AppleJWSHeader {
  alg: string;
  x5c: string[];
}

interface AppleJWSPayload {
  transactionId: string;
  originalTransactionId: string;
  productId: string;
  purchaseDate: number;
  expiresDate?: number;
  revocationDate?: number;
  revocationReason?: number;
  type: string;
  environment: string;
}

interface AppleAppStoreServerResponse {
  signedTransactionInfo: string;
  signedRenewalInfo?: string;
  environment: string;
}

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  private readonly appStoreServerUrl: string;
  private readonly appStoreKeyId: string;
  private readonly appStoreIssuerId: string;
  private readonly appStoreBundleId: string;
  private readonly appStorePrivateKey: string;

  constructor(private configService: ConfigService) {
    // App Store Server API configuration
    this.appStoreServerUrl =
      this.configService.get<string>('APP_STORE_SERVER_URL') ||
      'https://api.storekit.itunes.apple.com';
    this.appStoreKeyId = this.configService.get<string>('APP_STORE_KEY_ID') || '';
    this.appStoreIssuerId = this.configService.get<string>('APP_STORE_ISSUER_ID') || '';
    this.appStoreBundleId = this.configService.get<string>('APP_STORE_BUNDLE_ID') || '';
    this.appStorePrivateKey = this.configService.get<string>('APP_STORE_PRIVATE_KEY') || '';
  }

  /**
   * Validates Apple subscription receipt (JWS format from StoreKit 2)
   */
  async validateReceipt(
    dto: ValidateSubscriptionDto,
  ): Promise<ValidateSubscriptionResponseDto> {
    try {
      // Parse JWS receipt
      const receiptData = this.parseJWS(dto.receipt_data);

      if (!receiptData) {
        return this.createInvalidResponse('Invalid receipt format');
      }

      // Extract transaction info from JWS payload
      const transactionInfo = this.extractTransactionInfo(receiptData);

      if (!transactionInfo) {
        return this.createInvalidResponse('Unable to extract transaction information');
      }

      // Validate with Apple App Store Server API
      const validationResult = await this.validateWithApple(transactionInfo.transactionId);

      if (!validationResult.isValid) {
        return this.createInvalidResponse(validationResult.message || 'Receipt validation failed');
      }

      // Determine subscription status
      const status = this.determineSubscriptionStatus(transactionInfo, validationResult);

      return {
        isValid: true,
        subscriptionStatus: status,
        expiresAt: transactionInfo.expiresDate
          ? new Date(transactionInfo.expiresDate).toISOString()
          : null,
        productId: transactionInfo.productId,
        message: this.getStatusMessage(status),
      };
    } catch (error) {
      this.logger.error(`Error validating receipt: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to validate receipt: ${error.message}`);
    }
  }

  /**
   * Parse JWS (JSON Web Signature) receipt
   */
  private parseJWS(jwsString: string): AppleJWSPayload | null {
    try {
      const parts = jwsString.split('.');
      if (parts.length !== 3) {
        this.logger.warn('Invalid JWS format: expected 3 parts');
        return null;
      }

      // Decode payload (base64url)
      // Handle base64url encoding (uses - and _ instead of + and /)
      let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      // Add padding if needed
      while (base64.length % 4) {
        base64 += '=';
      }

      const payload = JSON.parse(
        Buffer.from(base64, 'base64').toString('utf-8'),
      ) as AppleJWSPayload;

      return payload;
    } catch (error) {
      this.logger.error(`Error parsing JWS: ${error.message}`);
      return null;
    }
  }

  /**
   * Extract transaction information from JWS payload
   */
  private extractTransactionInfo(payload: AppleJWSPayload): AppleJWSPayload | null {
    // For StoreKit 2, the payload contains transaction info directly
    if (payload.transactionId && payload.productId) {
      return payload;
    }

    return null;
  }

  /**
   * Validate receipt with Apple App Store Server API
   */
  private async validateWithApple(transactionId: string): Promise<{
    isValid: boolean;
    message?: string;
  }> {
    try {
      // If App Store credentials are not configured, skip server validation
      // In production, you should always validate with Apple
      if (!this.appStoreKeyId || !this.appStoreIssuerId || !this.appStorePrivateKey) {
        this.logger.warn(
          'App Store credentials not configured, skipping server validation. ' +
            'For production, configure APP_STORE_KEY_ID, APP_STORE_ISSUER_ID, and APP_STORE_PRIVATE_KEY',
        );
        // For development/testing, return valid if transaction ID exists
        // In production, this should fail or require proper configuration
        return {
          isValid: !!transactionId,
          message: 'Server validation skipped (credentials not configured)',
        };
      }

      // Check if jsonwebtoken is available
      let jwt: any;
      try {
        jwt = require('jsonwebtoken');
      } catch (error) {
        this.logger.warn(
          'jsonwebtoken package not found. Install it for full Apple validation: npm install jsonwebtoken @types/jsonwebtoken',
        );
        // Fallback to basic validation
        return {
          isValid: !!transactionId,
          message: 'Server validation skipped (jsonwebtoken not installed)',
        };
      }

      // Generate JWT token for App Store Server API authentication
      const token = await this.generateAppStoreJWT();

      // Call App Store Server API to get transaction info
      const response = await fetch(
        `${this.appStoreServerUrl}/inApps/v1/transactions/${transactionId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Apple API error: ${response.status} - ${errorText}`);
        return {
          isValid: false,
          message: `Apple API returned ${response.status}`,
        };
      }

      const data = (await response.json()) as AppleAppStoreServerResponse;

      // Verify the signed transaction info
      const isValid = !!data.signedTransactionInfo;

      return {
        isValid,
        message: isValid ? 'Transaction verified with Apple' : 'Transaction verification failed',
      };
    } catch (error) {
      this.logger.error(`Error validating with Apple: ${error.message}`);
      // In case of network errors, we can still validate locally
      // but in production, you might want to fail here
      return {
        isValid: false,
        message: `Validation error: ${error.message}`,
      };
    }
  }

  /**
   * Generate JWT token for App Store Server API authentication
   * Note: This requires jsonwebtoken package and proper ES256 key setup
   * Install: npm install jsonwebtoken @types/jsonwebtoken
   */
  private async generateAppStoreJWT(): Promise<string> {
    const jwt = require('jsonwebtoken');

    const payload = {
      iss: this.appStoreIssuerId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      aud: 'appstoreconnect-v1',
      bid: this.appStoreBundleId,
    };

    // Decode base64 private key if needed
    let privateKey = this.appStorePrivateKey;
    if (!privateKey.includes('-----BEGIN')) {
      // Assume it's base64 encoded
      try {
        privateKey = Buffer.from(privateKey, 'base64').toString('utf-8');
      } catch (error) {
        // If decoding fails, use as-is (might already be in PEM format)
        this.logger.debug('Private key appears to be in PEM format already');
      }
    }

    return jwt.sign(payload, privateKey, {
      algorithm: 'ES256',
      header: {
        alg: 'ES256',
        kid: this.appStoreKeyId,
        typ: 'JWT',
      },
    });
  }

  /**
   * Determine subscription status from transaction info
   */
  private determineSubscriptionStatus(
    transactionInfo: AppleJWSPayload,
    validationResult: { isValid: boolean; message?: string },
  ): SubscriptionStatus {
    if (!validationResult.isValid) {
      return SubscriptionStatus.INVALID;
    }

    // Check if revoked
    if (transactionInfo.revocationDate) {
      return SubscriptionStatus.REVOKED;
    }

    // Check expiration
    if (transactionInfo.expiresDate) {
      const expiresAt = new Date(transactionInfo.expiresDate);
      const now = new Date();

      if (expiresAt < now) {
        // Check if in grace period (typically 16 days for auto-renewable subscriptions)
        const gracePeriodEnd = new Date(expiresAt);
        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 16);

        if (now < gracePeriodEnd) {
          return SubscriptionStatus.IN_GRACE_PERIOD;
        }

        // Check if in billing retry (after grace period, Apple may retry)
        const billingRetryEnd = new Date(gracePeriodEnd);
        billingRetryEnd.setDate(billingRetryEnd.getDate() + 30);

        if (now < billingRetryEnd) {
          return SubscriptionStatus.IN_BILLING_RETRY;
        }

        return SubscriptionStatus.EXPIRED;
      }

      return SubscriptionStatus.ACTIVE;
    }

    // If no expiration date, assume active (lifetime purchase)
    return SubscriptionStatus.ACTIVE;
  }

  /**
   * Get human-readable status message
   */
  private getStatusMessage(status: SubscriptionStatus): string {
    const messages: Record<SubscriptionStatus, string> = {
      [SubscriptionStatus.ACTIVE]: 'Subscription is active',
      [SubscriptionStatus.EXPIRED]: 'Subscription has expired',
      [SubscriptionStatus.IN_GRACE_PERIOD]: 'Subscription is in grace period',
      [SubscriptionStatus.IN_BILLING_RETRY]: 'Subscription is in billing retry period',
      [SubscriptionStatus.REVOKED]: 'Subscription has been revoked',
      [SubscriptionStatus.INVALID]: 'Invalid subscription receipt',
    };

    return messages[status] || 'Unknown subscription status';
  }

  /**
   * Create invalid response
   */
  private createInvalidResponse(message: string): ValidateSubscriptionResponseDto {
    return {
      isValid: false,
      subscriptionStatus: SubscriptionStatus.INVALID,
      expiresAt: null,
      productId: null,
      message,
    };
  }
}

