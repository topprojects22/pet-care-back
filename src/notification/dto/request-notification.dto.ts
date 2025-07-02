import { IsNumber } from "class-validator";

export class RequestNotificationDto {

  @IsNumber()
  userId: number;
}