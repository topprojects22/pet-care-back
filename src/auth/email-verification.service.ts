import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { randomBytes } from 'crypto';

@Injectable()
export class EmailVerificationService {
  private readonly tokenExpirationHours = 24;

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

    // Отправляем email
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Подтверждение email адреса - Pet Care',
        template: 'email-verification', // Шаблон из templates/
        context: {
          verificationUrl,
          token,
          expirationHours: this.tokenExpirationHours,
        },
      });
    } catch (error) {
      // Логируем ошибку, но не прерываем процесс
      console.error('Failed to send verification email:', error);
      // В продакшене можно использовать Logger
    }
  }

  /**
   * Верифицирует email по токену
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    if (!token) {
      throw new BadRequestException('Verification token is required');
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

