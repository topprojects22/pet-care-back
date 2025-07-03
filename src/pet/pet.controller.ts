import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from "@nestjs/common";
import { PetService } from "./pet.service";
import {
  CreatePetDto,
  UpdatePetDto,
  CreatePetPassportDto,
} from "./dto/pet.dto";
import { Auth } from "src/auth/decorators/auth.decorator";

@Controller("pet")
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Get("user/:userId")
  @Auth()
  async getUserPets(@Param("userId") userId: string) {
    return this.petService.getUserPets(+userId);
  }

  @Get(":id")
  @Auth()
  async getPet(@Param("id") id: string) {
    return this.petService.getPetWithDetails(+id);
  }

  @Post()
  @Auth()
  async createPet(@Body() petData: CreatePetDto) {
    return this.petService.createPet(petData);
  }

  @Put(":id")
  @Auth()
  async updatePet(@Param("id") id: string, @Body() petData: UpdatePetDto) {
    return this.petService.updatePet(+id, petData);
  }

  @Delete(":id")
  @Auth()
  async deletePet(@Param("id") id: string) {
    return this.petService.deletePet(+id);
  }

  @Get("passport/:petId")
  @Auth()
  async getPetPassport(@Param("petId") petId: string) {
    return this.petService.getPetPassport(+petId);
  }

  @Post("passport")
  @Auth()
  async createPetPassport(@Body() passportData: CreatePetPassportDto) {
    return this.petService.createPetPassport(passportData);
  }

  @Delete("passport/:id")
  @Auth()
  async deletePetPassport(@Param("id") id: string) {
    return this.petService.deletePetPassport(+id);
  }

  @Post(":id/photos")
  @Auth()
  async addPetPhoto(
    @Param("id") petId: string,
    @Body() photoData: { url: string; isPrimary?: boolean }
  ) {
    return this.petService.addPetPhoto(
      +petId,
      photoData.url,
      photoData.isPrimary
    );
  }

  @Post("photos/:photoId/set-primary")
  @Auth()
  async setPrimaryPhoto(
    @Param("photoId") photoId: string,
    @Body("petId") petId: number
  ) {
    return this.petService.setPrimaryPhoto(petId,+photoId);
  }

  @Delete("photos/:photoId")
  @Auth()
  async deletePhoto(@Param("photoId") photoId: string) {
    return this.petService.deletePhoto(+photoId);
  }

  @Get(":id/medications")
  @Auth()
  async getPetMedications(@Param("id") petId: string) {
    return this.petService.getPetMedications(+petId);
  }

  @Get(":id/vaccinations")
  @Auth()
  async getPetVaccinations(@Param("id") petId: string) {
    return this.petService.getPetVaccinations(+petId);
  }
}
