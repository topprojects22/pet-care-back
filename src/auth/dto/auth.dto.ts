import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginAuthDto {
  @IsEmail()
  email: string;
  @MinLength(6, { message: 'Password must be at 6 character along' })
  @IsString()
  password: string;
}

export class RegisterAuthDto {
  @IsEmail()
  email: string;
  @MinLength(6, { message: 'Password must be at 6 character along' })
  @IsString()
  password: string;
}

export class AccessTokenAuthDto {
  @IsString()
  refreshToken: string;
}
