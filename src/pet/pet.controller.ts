import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Res,
  Query,
  Header,
} from "@nestjs/common";
import { Response } from 'express';
import { PetService } from "./pet.service";
import {
  CreatePetDto,
  UpdatePetDto,
  CreatePetPassportDto,
} from "./dto/pet.dto";
import { GetPetsQueryDto } from "./dto/get-pets-query.dto";
import { Query } from "@nestjs/common";
import { Auth } from "../auth/decorators/auth.decorator";
import { OwnershipGuard } from "../common/guards/ownership.guard";
import { Resource } from "../common/decorators/resource.decorator";
import { CurrentUser } from "../common/decorators/user.decorator";
import { User } from "@prisma/client";
import { PassportPdfService } from "./services/passport-pdf.service";

@Controller("pet")
export class PetController {
  constructor(
    private readonly petService: PetService,
    private readonly passportPdfService: PassportPdfService,
  ) {}

  @Get("user")
  @Auth()
  async getUserPets(
    @CurrentUser() user: User,
    @Query() query: GetPetsQueryDto
  ) {
    return this.petService.getUserPets(
      user.id,
      query.page || 1,
      query.limit || 20,
      query.type,
      query.sort || 'createdAt',
      query.order || 'desc'
    );
  }

  @Get(":id")
  @Auth()
  @Resource("pet")
  @UseGuards(OwnershipGuard)
  async getPet(@Param("id") id: string) {
    return this.petService.getPetWithDetails(+id);
  }

  @Post()
  @Auth()
  async createPet(
    @Body() petData: CreatePetDto,
    @CurrentUser() user: User
  ) {
    return this.petService.createPet(petData, user.id);
  }

  @Put(":id")
  @Auth()
  @Resource("pet")
  @UseGuards(OwnershipGuard)
  async updatePet(@Param("id") id: string, @Body() petData: UpdatePetDto) {
    return this.petService.updatePet(+id, petData);
  }

  @Delete(":id")
  @Auth()
  @Resource("pet")
  @UseGuards(OwnershipGuard)
  async deletePet(@Param("id") id: string) {
    return this.petService.deletePet(+id);
  }

  @Get(":petId/passport")
  @Auth()
  @Resource("pet")
  @UseGuards(OwnershipGuard)
  async getPetPassport(@Param("petId") petId: string) {
    return this.petService.getPetPassport(+petId);
  }

  @Post(":petId/passport")
  @Auth()
  @Resource("pet")
  @UseGuards(OwnershipGuard)
  async createPetPassport(
    @Param("petId") petId: string,
    @Body() passportData: CreatePetPassportDto,
  ) {
    return this.petService.createPetPassport({
      ...passportData,
      petId: +petId,
    });
  }

  @Delete(":petId/passport")
  @Auth()
  @Resource("pet")
  @UseGuards(OwnershipGuard)
  async deletePetPassport(@Param("petId") petId: string) {
    const passport = await this.petService.getPetPassport(+petId);
    if (passport) {
      return this.petService.deletePetPassport(passport.id);
    }
    throw new Error("Passport not found");
  }

  @Post(":petId/photos")
  @Auth()
  @Resource("pet")
  @UseGuards(OwnershipGuard)
  async addPetPhoto(
    @Param("petId") petId: string,
    @Body() photoData: { url: string; isPrimary?: boolean }
  ) {
    return this.petService.addPetPhoto(
      +petId,
      photoData.url,
      photoData.isPrimary
    );
  }

  @Post(":petId/photos/:photoId/set-primary")
  @Auth()
  @Resource("pet")
  @UseGuards(OwnershipGuard)
  async setPrimaryPhoto(
    @Param("petId") petId: string,
    @Param("photoId") photoId: string
  ) {
    return this.petService.setPrimaryPhoto(+petId, +photoId);
  }

  @Delete(":petId/photos/:photoId")
  @Auth()
  @Resource("pet")
  @UseGuards(OwnershipGuard)
  async deletePhoto(
    @Param("petId") petId: string,
    @Param("photoId") photoId: string
  ) {
    return this.petService.deletePhoto(+photoId);
  }

  @Get(":petId/medications")
  @Auth()
  @Resource("pet")
  @UseGuards(OwnershipGuard)
  async getPetMedications(@Param("petId") petId: string) {
    return this.petService.getPetMedications(+petId);
  }

  @Get(":petId/vaccinations")
  @Auth()
  @Resource("pet")
  @UseGuards(OwnershipGuard)
  async getPetVaccinations(@Param("petId") petId: string) {
    return this.petService.getPetVaccinations(+petId);
  }

  @Get(":petId/passport/pdf")
  @Auth()
  @Resource("pet")
  @UseGuards(OwnershipGuard)
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename=pet-passport.pdf')
  async getPetPassportPdf(
    @Param("petId") petId: string,
    @Res() res: Response,
  ) {
    const buffer = await this.passportPdfService.generatePassportPdf(+petId);
    res.send(buffer);
  }

  @Get(":petId/passport/qr")
  @Auth()
  @Resource("pet")
  @UseGuards(OwnershipGuard)
  @Header('Content-Type', 'image/png')
  async getPetPassportQr(
    @Param("petId") petId: string,
    @Res() res: Response,
  ) {
    const passport = await this.petService.getPetPassport(+petId);
    if (!passport || !passport.chip) {
      throw new Error('Passport not found or chip number missing');
    }
    
    // Генерируем QR-код через библиотеку qrcode
    const QRCode = await import('qrcode');
    const qrData = passport.qrCode || `https://petcare.app/pet/${petId}/passport?chip=${passport.chip}`;
    const qrCodeBuffer = await QRCode.toBuffer(qrData, {
      errorCorrectionLevel: 'M',
      type: 'png',
      width: 300,
      margin: 1,
    });
    
    res.send(qrCodeBuffer);
  }
}
