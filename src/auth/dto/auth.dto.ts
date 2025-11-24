import { IsEmail, IsString, MinLength, Matches, IsNotEmpty, IsOptional } from 'class-validator';
import { IsStrongPassword } from '../../common/validators/password.validator';

export class LoginAuthDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsString({ message: 'Password must be a string' })
  password!: string;
}

export class RegisterAuthDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsStrongPassword({
    message:
      'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character',
  })
  password!: string;
}

export class AccessTokenAuthDto {
  @IsString()
  refreshToken!: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Password must contain at least one letter and one number'
  })
  newPassword!: string;

  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/)
  confirmPassword!: string;
}

export class GoogleAuthDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsOptional()
  deviceId?: string;
}

export class AppleAuthDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsOptional()
  identityToken?: string;

  @IsString()
  @IsOptional()
  authorizationCode?: string;

  @IsString()
  @IsOptional()
  deviceId?: string;
}
