import { IsNumber } from "class-validator";

export class RequestPetDto {

  @IsNumber()
  userId: number;
}