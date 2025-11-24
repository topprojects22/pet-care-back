import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import {
  LoginAuthDto,
  AccessTokenAuthDto,
  RegisterAuthDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "./dto/auth.dto";
import { PrismaService } from "../prisma.service";
import { faker } from "@faker-js/faker";
import { hash, verify } from "argon2";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { EmailVerificationService } from "./email-verification.service";
import { ConfigService } from "@nestjs/config";
import { MailerService } from "@nestjs-modules/mailer";
import { randomBytes } from "crypto";
import { GoogleAuthService } from "./services/google-auth.service";
import { AppleAuthService } from "./services/apple-auth.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly appleAuthService: AppleAuthService,
  ) {}


  async login(loginAuthDto: LoginAuthDto) {
    const user = await this.validateUser(loginAuthDto);
    if (!user.role) {
      throw new UnauthorizedException('User role not found');
    }
    const tokens = await this.issueToken(user.id, user.role.name);

    const userFields = this.returnUserFields(user);
    return {
      userFields,
      ...tokens,
    };
  }
  async register(registerAuthDto: RegisterAuthDto) {
    const existUser = await this.prisma.user.findUnique({
      where: {
        email: registerAuthDto.email,
      },
    });
    if (existUser) {
      throw new BadRequestException("User already exist");
    }

    const userRole = await this.prisma.role.findUnique({
      where: { name: "user" },
    });

    if (!userRole) {
      throw new InternalServerErrorException('Default role "user" not found');
    }

    const user = await this.prisma.user.create({
      data: {
        email: registerAuthDto.email,
        name: faker.name.firstName(),
        avatarPath: faker.image.avatar(),
        phone: faker.phone.number("+7 (###) ###-##-##"),
        password: await hash(registerAuthDto.password),
        roleId: userRole.id,
        isVerified: false, // Email не верифицирован при регистрации
      },
    });

    // Отправляем email для верификации
    try {
      await this.emailVerificationService.sendVerificationEmail(
        user.id,
        user.email,
      );
    } catch (error) {
      // Логируем ошибку, но не прерываем регистрацию
      console.error("Failed to send verification email:", error);
    }

    const tokens = await this.issueToken(user.id, "user");

    const userFields = this.returnUserFields(user);
    
    // Унифицированный формат ответа
    return {
      data: {
        ...tokens,
        user: {
          id: userFields.id,
          email: userFields.email,
          name: userFields.name,
          lastName: userFields.lastName,
          avatarPath: userFields.avatarPath,
          isVerified: userFields.isVerified,
        },
      },
      message: "Registration successful. Please check your email to verify your account.",
    };
  }
  async getNewToken(accessTokenAuthDto: AccessTokenAuthDto) {
    const result = await this.jwt.verifyAsync(accessTokenAuthDto.refreshToken);
    if (!result) {
      throw new UnauthorizedException("Invalid access token");
    }
    const user = await this.prisma.user.findUnique({
      where: {
        id: result.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        avatarPath: true,
        roleId: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            name: true,
          },
        },
        lastName: true,
        middleName: true,
        lastLoginAt: true,
        isVerified: true,
        birthDate: true,
        address: true,
        emergencyContact: true,
        preferences: true,
        insuranceNumber: true,
        socialMedia: true,
        isSubscribed: true,
        lastActivityAt: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (!user.role) {
      throw new UnauthorizedException('User role not found');
    }
    const tokens = await this.issueToken(user.id, user.role.name);
    const userFields = this.returnUserFields(user);
    
    // Унифицированный формат ответа
    return {
      data: {
        ...tokens,
        user: {
          id: userFields.id,
          email: userFields.email,
          name: userFields.name,
          lastName: userFields.lastName,
          avatarPath: userFields.avatarPath,
          isVerified: userFields.isVerified,
        },
      },
    };
  }

  private async issueToken(userId: number, role: string) {
    const data = { id: userId, role: role };
    const accessTokenExpiresIn = this.configService.get<string>('app.jwt.accessTokenExpiresIn', '15m');
    const refreshTokenExpiresIn = this.configService.get<string>('app.jwt.refreshTokenExpiresIn', '7d');
    
    const accessToken = this.jwt.sign(data, {
      expiresIn: accessTokenExpiresIn,
    });
    const refreshToken = this.jwt.sign(data, {
      expiresIn: refreshTokenExpiresIn,
    });
    
    // Вычисляем реальное время истечения access token
    const expiresInSeconds = this.parseExpiresIn(accessTokenExpiresIn);
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();
    
    return { accessToken, refreshToken, expiresAt };
  }

  /**
   * Парсит строку expiresIn в секунды
   * Поддерживает форматы: "15m", "7d", "1h", "30s"
   */
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 900; // По умолчанию 15 минут
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 900;
    }
  }
  private returnUserFields(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      avatarPath: user.avatarPath,
      isVerified: user.isVerified,
    };
  }
  private async validateUser(loginDto: LoginAuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginDto.email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        avatarPath: true,
        roleId: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            name: true,
          },
        },
        lastName: true,
        middleName: true,
        lastLoginAt: true,
        isVerified: true,
        birthDate: true,
        address: true,
        emergencyContact: true,
        preferences: true,
        insuranceNumber: true,
        socialMedia: true,
        isSubscribed: true,
        lastActivityAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException("User dont exist");
    }
    const isValid = await verify(user.password, loginDto.password);
    if (!isValid) {
      throw new UnauthorizedException("Invalid credentials");
    }
    return user;
  }

  /**
   * Отправляет email с токеном для сброса пароля
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string; expiresIn: number }> {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    // Всегда возвращаем успех для безопасности (предотвращение перебора email)
    if (!user) {
      return {
        message: 'If the email exists, a password reset link has been sent',
        expiresIn: 3600, // 1 час
      };
    }

    // Удаляем старые токены для этого пользователя
    await this.prisma.passwordReset.deleteMany({
      where: { userId: user.id },
    });

    // Генерируем новый токен
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Токен действителен 1 час

    // Сохраняем токен в БД
    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Формируем URL для сброса пароля
    const apiPrefix = this.configService.get<string>('app.apiPrefix', 'api');
    const baseUrl =
      this.configService.get<string>('APP_URL') ||
      'http://localhost:5000';
    const resetUrl = `${baseUrl}/${apiPrefix}/auth/reset-password?token=${token}`;

    // Отправляем email
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Восстановление пароля - Pet Care',
        template: 'password-reset', // Шаблон из templates/
        context: {
          resetUrl,
          token,
          expirationHours: 1,
          userName: user.name || 'Пользователь',
        },
      });
    } catch (error) {
      // Логируем ошибку, но не прерываем процесс
      console.error('Failed to send password reset email:', error);
    }

    return {
      message: 'Password reset email has been sent',
      expiresIn: 3600,
    };
  }

  /**
   * Сбрасывает пароль по токену
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    // Проверяем совпадение паролей
    if (resetPasswordDto.newPassword !== resetPasswordDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Находим запись о сбросе пароля
    const passwordReset = await this.prisma.passwordReset.findUnique({
      where: { token: resetPasswordDto.token },
      include: { user: true },
    });

    if (!passwordReset) {
      throw new NotFoundException('Invalid or expired reset token');
    }

    // Проверяем срок действия токена
    if (new Date() > passwordReset.expiresAt) {
      // Удаляем просроченный токен
      await this.prisma.passwordReset.delete({
        where: { id: passwordReset.id },
      });
      throw new UnauthorizedException('Reset token has expired');
    }

    // Проверяем, не использован ли уже токен
    if (passwordReset.usedAt) {
      throw new BadRequestException('Reset token has already been used');
    }

    // Хешируем новый пароль
    const hashedPassword = await hash(resetPasswordDto.newPassword);

    // Обновляем пароль и помечаем токен как использованный
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: passwordReset.userId },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return {
      message: 'Password has been reset successfully',
    };
  }

  /**
   * Авторизация через Google
   */
  async googleAuth(token: string, deviceId?: string) {
    // Валидируем Google token
    const googleUser = await this.googleAuthService.validateGoogleToken(token);

    // Ищем или создаем пользователя
    let user = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
      include: { role: true },
    });

    if (!user) {
      // Создаем нового пользователя
      const userRole = await this.prisma.role.findUnique({
        where: { name: 'user' },
      });

      if (!userRole) {
        throw new InternalServerErrorException('Default role "user" not found');
      }

      // Генерируем случайный пароль (пользователь не будет его использовать)
      const randomPassword = randomBytes(32).toString('hex');
      const hashedPassword = await hash(randomPassword);

      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.given_name || googleUser.name.split(' ')[0],
          lastName: googleUser.family_name || googleUser.name.split(' ').slice(1).join(' '),
          password: hashedPassword,
          avatarPath: googleUser.picture || 'uploads/default-avatar.png',
          roleId: userRole.id,
          isVerified: googleUser.verified_email, // Email уже верифицирован через Google
          socialMedia: {
            google: {
              id: googleUser.id,
              email: googleUser.email,
            },
          },
        },
        include: { role: true },
      });
    } else {
      // Обновляем информацию о социальной сети, если нужно
      const socialMedia = (user.socialMedia as any) || {};
      socialMedia.google = {
        id: googleUser.id,
        email: googleUser.email,
      };

      // Обновляем аватар, если его нет или если Google предоставил новый
      if (!user.avatarPath || user.avatarPath === 'uploads/default-avatar.png') {
        if (googleUser.picture) {
          await this.prisma.user.update({
            where: { id: user.id },
            data: {
              avatarPath: googleUser.picture,
              socialMedia,
            },
          });
        }
      }
    }

    // Выдаем токены
    const tokens = await this.issueToken(user.id, user.role?.name || 'user');
    const userFields = this.returnUserFields(user);

    return {
      data: {
        ...tokens,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 минут
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarPath: user.avatarPath,
          isVerified: user.isVerified,
        },
      },
    };
  }

  /**
   * Авторизация через Apple
   */
  async appleAuth(
    token: string,
    identityToken?: string,
    authorizationCode?: string,
    deviceId?: string,
  ) {
    // Используем identityToken для валидации
    const tokenToValidate = identityToken || token;
    const appleUser = await this.appleAuthService.validateAppleToken(tokenToValidate);

    // Ищем или создаем пользователя
    let user = await this.prisma.user.findUnique({
      where: { email: appleUser.email },
      include: { role: true },
    });

    if (!user) {
      // Создаем нового пользователя
      const userRole = await this.prisma.role.findUnique({
        where: { name: 'user' },
      });

      if (!userRole) {
        throw new InternalServerErrorException('Default role "user" not found');
      }

      // Генерируем случайный пароль
      const randomPassword = randomBytes(32).toString('hex');
      const hashedPassword = await hash(randomPassword);

      user = await this.prisma.user.create({
        data: {
          email: appleUser.email,
          name: appleUser.name?.firstName || 'User',
          lastName: appleUser.name?.lastName,
          password: hashedPassword,
          avatarPath: 'uploads/default-avatar.png',
          roleId: userRole.id,
          isVerified: appleUser.email_verified,
          socialMedia: {
            apple: {
              id: appleUser.id,
              email: appleUser.email,
            },
          },
        },
        include: { role: true },
      });
    } else {
      // Обновляем информацию о социальной сети
      const socialMedia = (user.socialMedia as any) || {};
      socialMedia.apple = {
        id: appleUser.id,
        email: appleUser.email,
      };

      await this.prisma.user.update({
        where: { id: user.id },
        data: { socialMedia },
      });
    }

    // Выдаем токены
    const tokens = await this.issueToken(user.id, user.role?.name || 'user');
    const userFields = this.returnUserFields(user);

    return {
      data: {
        ...tokens,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarPath: user.avatarPath,
          isVerified: user.isVerified,
        },
      },
    };
  }
}
