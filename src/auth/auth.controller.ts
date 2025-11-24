import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginAuthDto,
  RegisterAuthDto,
  AccessTokenAuthDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  GoogleAuthDto,
  AppleAuthDto,
} from './dto/auth.dto';
import { EmailVerificationService } from './email-verification.service';
import { Auth } from './decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @UsePipes(new ValidationPipe())
  @Post('login')
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }
  @UsePipes(new ValidationPipe())
  @Post('register')
  register(@Body() registerAuthDto: RegisterAuthDto) {
    return this.authService.register(registerAuthDto);
  }
  @UsePipes(new ValidationPipe())
  @Post('refresh')
  getNewToken(@Body() accessTokenAuthDto: AccessTokenAuthDto) {
    return this.authService.getNewToken(accessTokenAuthDto);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.emailVerificationService.verifyEmail(token);
  }

  @Post('resend-verification')
  @Auth()
  async resendVerificationEmail(@CurrentUser() user: User) {
    await this.emailVerificationService.resendVerificationEmail(user.id);
    return {
      success: true,
      message: 'Verification email has been sent',
    };
  }

  @UsePipes(new ValidationPipe())
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @UsePipes(new ValidationPipe())
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UsePipes(new ValidationPipe())
  @Post('google')
  async googleAuth(@Body() googleAuthDto: GoogleAuthDto) {
    return this.authService.googleAuth(googleAuthDto.token, googleAuthDto.deviceId);
  }

  @UsePipes(new ValidationPipe())
  @Post('apple')
  async appleAuth(@Body() appleAuthDto: AppleAuthDto) {
    return this.authService.appleAuth(
      appleAuthDto.token,
      appleAuthDto.identityToken,
      appleAuthDto.authorizationCode,
      appleAuthDto.deviceId,
    );
  }
}
