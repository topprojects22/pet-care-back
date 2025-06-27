import { Prisma } from '@prisma/client';
import { ArrayMinSize, IsNumber, IsOptional, IsString } from 'class-validator';

export class GameDto implements Prisma.GameUpdateInput {
  @IsString()
  name: string;

  @IsString()
  value: string;

  @IsString()
  size: string;

  @IsNumber()
  userId: number;
}
