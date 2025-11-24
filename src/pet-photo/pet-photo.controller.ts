// src/pet-photo/pet-photo.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { PetPhotoService } from "./pet-photo.service";
import { CreatePetPhotoDto } from "./dto/create-pet-photo.dto";
import { UpdatePetPhotoDto } from "./dto/update-pet-photo.dto";
import { Auth } from "../auth/decorators/auth.decorator";
import { FileUploadService } from "../common/services/file-upload.service";
import { FileStorageService } from "../common/services/file-storage.service";
import { CurrentUser } from "../common/decorators/user.decorator";
import { User } from "@prisma/client";
import { Resource } from "../common/decorators/resource.decorator";
import { OwnershipGuard } from "../common/guards/ownership.guard";

// Конфигурация для загрузки фото питомцев
const PET_PHOTO_UPLOAD_CONFIG = {
  destination: "uploads/pet-photos",
  maxSize: 5 * 1024 * 1024, // 5 MB
  prefix: "pet-photo",
  allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  allowedExtensions: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
};

@Controller("pets/:petId/photos")
export class PetPhotoController {
  private multerOptions: any;

  constructor(
    private readonly photoService: PetPhotoService,
    private readonly fileUploadService: FileUploadService,
    private readonly fileStorageService: FileStorageService,
  ) {
    // Инициализируем опции Multer в конструкторе
    this.multerOptions = this.fileUploadService.createMulterOptions(PET_PHOTO_UPLOAD_CONFIG);
  }

  // 🆕 Загрузка одного фото (обратная совместимость)
  @Post("upload")
  @Auth()
  @Resource("pet")
  @UseGuards(OwnershipGuard)
  // @ts-ignore - декораторы выполняются до инициализации класса
  @UseInterceptors(FileInterceptor("photo", this.multerOptions))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Param("petId") petId: string,
    @CurrentUser() user: User,
    @Body() dto?: CreatePetPhotoDto
  ) {
    if (!file) {
      throw new BadRequestException("Photo file is required");
    }

    const userId = user.id;

    // Обрабатываем файл через универсальный сервис
    const fileInfo = this.fileUploadService.processUploadedFile(file, {
      destination: "uploads/pet-photos",
      prefix: "pet-photo",
    });

    // Сохраняем в БД
    return this.photoService.createPhoto(
      userId,
      +petId,
      fileInfo.url,
      dto || { isPrimary: false }
    );
  }

  // 🆕 Загрузка нескольких фото
  @Post("upload-multiple")
  @Auth()
  @Resource("pet")
  @UseGuards(OwnershipGuard)
  // @ts-ignore - декораторы выполняются до инициализации класса
  @UseInterceptors(FilesInterceptor("photos", 10, this.multerOptions))
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Param("petId") petId: string,
    @CurrentUser() user: User
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException("At least one photo file is required");
    }

    const userId = user.id;

    // Обрабатываем все файлы
    const uploadedFiles = this.fileUploadService.processUploadedFiles(files, {
      destination: "uploads/pet-photos",
      prefix: "pet-photo",
    });

    // Сохраняем все фото в БД
    const savedPhotos = await Promise.all(
      uploadedFiles.map((fileInfo) =>
        this.photoService.createPhoto(userId, +petId, fileInfo.url, {
          isPrimary: false,
        })
      )
    );

    return {
      success: true,
      message: `Successfully uploaded ${uploadedFiles.length} photo(s)`,
      photos: savedPhotos.map((photo, index) => ({
        id: photo.id,
        url: uploadedFiles[index].url,
        filename: uploadedFiles[index].filename,
        hash: uploadedFiles[index].hash,
      })),
    };
  }

// TODO проверить работу без этого метода
//   // ❌ Старый метод создания через JSON — можно оставить или удалить
//   // (обычно при загрузке файлов клиент не отправляет JSON с url)
//   @Post()
//   @Auth()
//   create(
//     @Param("petId") petId: string,
//     @Body() dto: CreatePetPhotoDto,
//     @Req() req
//   ) {
//     return this.photoService.createPhoto(req.user.id, +petId, dto);
//   }

  @Get()
  @Auth()
  @Resource("pet")
  @UseGuards(OwnershipGuard)
  findAll(@Param("petId") petId: string) {
    return this.photoService.findAllForPet(+petId);
  }

  @Get(":id")
  @Auth()
  findOne(@Param("id") id: string) {
    return this.photoService.findOne(+id);
  }

  @Patch(":id")
  @Auth()
  @Resource("petPhoto")
  @UseGuards(OwnershipGuard)
  update(@Param("id") id: string, @Body() dto: UpdatePetPhotoDto, @CurrentUser() user: User) {
    return this.photoService.updatePhoto(user.id, +id, dto);
  }

  @Delete(":id")
  @Auth()
  @Resource("petPhoto")
  @UseGuards(OwnershipGuard)
  remove(@Param("id") id: string, @CurrentUser() user: User) {
    return this.photoService.removePhoto(user.id, +id);
  }

  @Patch(":id/primary")
  @Auth()
  @Resource("petPhoto")
  @UseGuards(OwnershipGuard)
  setPrimary(@Param("id") id: string, @CurrentUser() user: User) {
    return this.photoService.setPrimary(user.id, +id);
  }
}
