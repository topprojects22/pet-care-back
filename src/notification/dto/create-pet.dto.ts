import { IsNumber, IsString } from "class-validator";

export class CreatePetDto {

    @IsString()
    name: string

    @IsNumber()
    userId: number;
}