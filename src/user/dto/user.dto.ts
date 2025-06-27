import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  avatarPath: string;
}
