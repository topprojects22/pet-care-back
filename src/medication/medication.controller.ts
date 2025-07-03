import { Controller, Post, Put, Delete, Param, Body, Get } from "@nestjs/common";
import { MedicationService } from "./medication.service";
import { CreateMedicationDto, UpdateMedicationDto } from "./dto/medication.dto";
import { Auth } from "src/auth/decorators/auth.decorator";

@Controller("medication")
export class MedicationController {
  constructor(private readonly medicationsService: MedicationService) {}

  @Post()
  @Auth()
  async createMedication(@Body() medicationData: CreateMedicationDto) {
    return this.medicationsService.addMedication(
      medicationData.petId,
      medicationData
    );
  }

  @Put(":id")
  @Auth()
  async updateMedication(
    @Param("id") id: string,
    @Body() medicationData: UpdateMedicationDto
  ) {
    return this.medicationsService.updateMedication(+id, medicationData);
  }

  @Delete(":id")
  @Auth()
  async deleteMedication(@Param("id") id: string) {
    return this.medicationsService.deleteMedication(+id);
  }

  @Get(":petId")
  @Auth()
  async getPetMedications(@Param("petId") petId: string) {
    return this.medicationsService.getPetMedications(+petId);
  }
}
