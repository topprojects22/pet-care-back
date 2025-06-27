import { IsEmail } from 'class-validator';
import { UploadedFile } from '@nestjs/common';

export class UploadImageDto {
  @IsEmail()
  email: string;
}
