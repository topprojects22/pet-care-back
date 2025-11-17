import { IsEmail, IsString } from 'class-validator';
import { IsStrongPassword } from '../../common/validators/password.validator';

export class LoginAuthDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  password: string;
}

export class RegisterAuthDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsStrongPassword({
    message:
      'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character',
  })
  password: string;
}

export class AccessTokenAuthDto {
  @IsString()
  refreshToken: string;
}
