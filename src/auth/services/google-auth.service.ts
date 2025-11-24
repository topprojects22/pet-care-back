import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

@Injectable()
export class GoogleAuthService {
  constructor(private configService: ConfigService) {}

  /**
   * Валидирует Google ID token и получает информацию о пользователе
   */
  async validateGoogleToken(token: string): Promise<GoogleUserInfo> {
    try {
      // Используем Google API для проверки токена
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`,
      );

      if (!response.ok) {
        throw new UnauthorizedException('Failed to validate Google token');
      }

      const data = await response.json();

      // Проверяем, что токен валиден
      if (!data.email || !data.email_verified) {
        throw new UnauthorizedException('Invalid Google token: email not verified');
      }

      // Проверяем, что токен выдан для нашего приложения (если указан CLIENT_ID)
      const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      if (googleClientId && data.aud !== googleClientId) {
        throw new UnauthorizedException('Invalid Google token: wrong audience');
      }

      return {
        id: data.sub,
        email: data.email,
        verified_email: data.email_verified === 'true',
        name: data.name || `${data.given_name || ''} ${data.family_name || ''}`.trim(),
        given_name: data.given_name,
        family_name: data.family_name,
        picture: data.picture,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to validate Google token');
    }
  }
}

