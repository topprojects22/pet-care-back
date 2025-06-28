import { IsNumber, IsString } from "class-validator";

export class PetDto {
  @IsString()
  name: string;

  @IsNumber()
  userId: number;
}
