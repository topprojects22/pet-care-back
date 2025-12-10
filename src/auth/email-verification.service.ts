import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { randomBytes } from 'crypto';
import { isDevelopment } from '../common/utils/env.util';

@Injectable()
export class EmailVerificationService {
  private readonly tokenExpirationHours = 24;
  private readonly logger = new Logger(EmailVerificationService.name);

  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  /**
   * Генерирует токен верификации
   */
  private generateVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Создает запись о верификации и отправляет email
   */
  async sendVerificationEmail(userId: number, email: string): Promise<void> {
    // Удаляем старые токены для этого пользователя
    await this.prisma.emailVerification.deleteMany({
      where: { userId },
    });

    // Генерируем новый токен
    const token = this.generateVerificationToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.tokenExpirationHours);

    // Сохраняем токен в БД
    await this.prisma.emailVerification.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    // Формируем URL для верификации
    const apiPrefix = this.configService.get<string>('app.apiPrefix', 'api');
    const baseUrl =
      this.configService.get<string>('APP_URL') ||
      'http://localhost:5000';
    const verificationUrl = `${baseUrl}/${apiPrefix}/auth/verify-email?token=${token}`;

    // В development режиме мокаем отправку email
    if (isDevelopment()) {
      this.logger.log(
        `[DEV MODE] Email verification would be sent to: ${email}`,
      );
      this.logger.log(`[DEV MODE] Verification URL: ${verificationUrl}`);
      this.logger.log(`[DEV MODE] Token: ${token}`);
      return;
    }

    // Отправляем email в production
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Подтверждение email адреса - Pet Care',
        template: 'email-verification', // Шаблон из templates/
        context: {
          verificationUrl,
          token,
          expirationHours: this.tokenExpirationHours,
          currentYear: new Date().getFullYear(),
        },
      });
      this.logger.log(`Verification email sent to: ${email}`);
    } catch (error) {
      // Логируем ошибку, но не прерываем процесс
      this.logger.error('Failed to send verification email:', error);
    }
  }

  /**
   * Верифицирует email по токену
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    if (!token) {
      throw new BadRequestException('Verification token is required');
    }

    // В development режиме обрабатываем специальный токен "111111"
    if (isDevelopment() && token === '111111') {
      this.logger.log('[DEV MODE] Using development token "111111" for email verification');
      
      // Находим последнего неверифицированного пользователя
      const user = await this.prisma.user.findFirst({
        where: { isVerified: false },
        orderBy: { createdAt: 'desc' },
      });

      if (!user) {
        throw new NotFoundException('No unverified user found');
      }

      // Верифицируем пользователя
      await this.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });

      this.logger.log(`[DEV MODE] Email verified for user: ${user.email} (ID: ${user.id})`);

      return {
        success: true,
        message: 'Email successfully verified (development mode)',
      };
    }

    // Находим запись о верификации
    const verification = await this.prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification) {
      throw new NotFoundException('Invalid verification token');
    }

    // Проверяем срок действия токена
    if (new Date() > verification.expiresAt) {
      // Удаляем просроченный токен
      await this.prisma.emailVerification.delete({
        where: { id: verification.id },
      });
      throw new UnauthorizedException('Verification token has expired');
    }

    // Проверяем, не верифицирован ли уже email
    if (verification.user.isVerified) {
      // Удаляем токен, так как он уже использован
      await this.prisma.emailVerification.delete({
        where: { id: verification.id },
      });
      return {
        success: true,
        message: 'Email already verified',
      };
    }

    // Обновляем статус пользователя и удаляем токен
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verification.userId },
        data: { isVerified: true },
      }),
      this.prisma.emailVerification.update({
        where: { id: verification.id },
        data: { verifiedAt: new Date() },
      }),
    ]);

    return {
      success: true,
      message: 'Email successfully verified',
    };
  }

  /**
   * Повторно отправляет email верификации
   */
  async resendVerificationEmail(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email is already verified');
    }

    await this.sendVerificationEmail(userId, user.email);
  }

  /**
   * Проверяет, верифицирован ли email пользователя
   */
  async isEmailVerified(userId: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isVerified: true },
    });

    return user?.isVerified || false;
  }
}

