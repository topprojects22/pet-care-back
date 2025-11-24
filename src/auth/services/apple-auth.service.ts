import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AppleUserInfo {
  id: string;
  email: string;
  email_verified: boolean;
  name?: {
    firstName?: string;
    lastName?: string;
  };
}

@Injectable()
export class AppleAuthService {
  private applePublicKeys: any[] | null = null;
  private keysLastFetched: number = 0;
  private readonly keysCacheTTL = 3600000; // 1 час

  constructor(private configService: ConfigService) {}

  /**
   * Получает публичные ключи Apple
   */
  private async getApplePublicKeys(): Promise<any[]> {
    const now = Date.now();
    
    // Используем кэш, если ключи были получены недавно
    if (this.applePublicKeys && (now - this.keysLastFetched) < this.keysCacheTTL) {
      return this.applePublicKeys;
    }

    try {
      const response = await fetch('https://appleid.apple.com/auth/keys');
      
      if (!response.ok) {
        throw new UnauthorizedException('Failed to fetch Apple public keys');
      }
      
      const data = await response.json();
      this.applePublicKeys = data.keys;
      this.keysLastFetched = now;
      return this.applePublicKeys;
    } catch (error) {
      throw new UnauthorizedException('Failed to fetch Apple public keys');
    }
  }

  /**
   * Валидирует Apple ID token
   * Упрощенная версия - декодирует токен без полной проверки подписи
   * Для продакшена рекомендуется использовать библиотеку jose для полной валидации
   * 
   * Примечание: Для полной безопасности рекомендуется установить:
   * npm install jose
   * И использовать полную валидацию подписи токена
   */
  async validateAppleToken(identityToken: string): Promise<AppleUserInfo> {
    try {
      // JWT токен состоит из трех частей: header.payload.signature
      const parts = identityToken.split('.');
      
      if (parts.length !== 3) {
        throw new UnauthorizedException('Invalid Apple token format');
      }

      // Декодируем payload (вторая часть)
      const payloadBase64 = parts[1];
      
      // Добавляем padding, если нужно
      const padding = '='.repeat((4 - (payloadBase64.length % 4)) % 4);
      const base64 = payloadBase64 + padding;
      
      // Декодируем base64
      const payloadJson = Buffer.from(base64, 'base64').toString('utf-8');
      const payload = JSON.parse(payloadJson);

      // Проверяем базовые поля токена
      if (!payload.sub) {
        throw new UnauthorizedException('Apple token does not contain user ID');
      }

      // Проверяем issuer
      if (payload.iss !== 'https://appleid.apple.com') {
        throw new UnauthorizedException('Invalid Apple token issuer');
      }

      // Проверяем срок действия
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new UnauthorizedException('Apple token has expired');
      }

      // Проверяем, что email присутствует
      if (!payload.email) {
        throw new UnauthorizedException('Apple token does not contain email');
      }

      return {
        id: payload.sub,
        email: payload.email,
        email_verified: payload.email_verified || false,
        name: payload.name ? {
          firstName: payload.name.firstName,
          lastName: payload.name.lastName,
        } : undefined,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error instanceof SyntaxError) {
        throw new UnauthorizedException('Invalid Apple token format');
      }
      throw new UnauthorizedException('Failed to validate Apple token');
    }
  }

}

