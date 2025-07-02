import { IsNumber, IsString } from "class-validator";

export class NotificationDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  type: string;
}
