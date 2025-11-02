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
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { PetPhotoService } from "./pet-photo.service";
import { CreatePetPhotoDto } from "./dto/create-pet-photo.dto";
import { UpdatePetPhotoDto } from "./dto/update-pet-photo.dto";
import { Auth } from "../auth/decorators/auth.decorator";

@Controller("pets/:petId/photos")
export class PetPhotoController {
  constructor(private readonly photoService: PetPhotoService) {}

  // 🆕 Новый метод для загрузки фото с устройства
  @Post("upload")
  @Auth()
  @UseInterceptors(
    FileInterceptor("photo", {
      storage: diskStorage({
        destination: "./uploads/pet-photos",
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname).toLowerCase();
          // Разрешаем только изображения
          if (![".jpg", ".jpeg", ".png", ".gif"].includes(ext)) {
            return callback(new BadRequestException("Invalid file type"), null);
          }
          callback(null, `photo-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(
            new BadRequestException("Only image files are allowed!"),
            false
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
      },
    })
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Param("petId") petId: string,
    @Req() req
  ) {
    if (!file) {
      throw new BadRequestException("Photo file is required");
    }

    const userId = req.user.id;

    // Формируем URL относительно корня сервера (для фронтенда)
    const url = `/uploads/pet-photos/${file.filename}`;

    // Создаём фото. isPrimary можно передавать как query-параметр или в form-data,
    // но для простоты пока делаем не главным по умолчанию.
    const dto: CreatePetPhotoDto = {
      isPrimary: false, // можно расширить логику позже
    };

    return this.photoService.createPhoto(userId, +petId, url, dto);
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
  findAll(@Param("petId") petId: string) {
    return this.photoService.findAllForPet(+petId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.photoService.findOne(+id);
  }

  @Patch(":id")
  @Auth()
  update(@Param("id") id: string, @Body() dto: UpdatePetPhotoDto, @Req() req) {
    return this.photoService.updatePhoto(req.user.id, +id, dto);
  }

  @Delete(":id")
  @Auth()
  remove(@Param("id") id: string, @Req() req) {
    return this.photoService.removePhoto(req.user.id, +id);
  }

  @Patch(":id/primary")
  @Auth()
  setPrimary(@Param("id") id: string, @Req() req) {
    return this.photoService.setPrimary(req.user.id, +id);
  }
}
