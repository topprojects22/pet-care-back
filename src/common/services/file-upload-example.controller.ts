/**
 * ПРИМЕР ИСПОЛЬЗОВАНИЯ УНИВЕРСАЛЬНОГО СЕРВИСА ЗАГРУЗКИ ИЗОБРАЖЕНИЙ
 * 
 * Этот файл демонстрирует, как использовать FileUploadService
 * для загрузки нескольких изображений с хешированием имен
 */

import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';
import { FileStorageService } from './file-storage.service';
import { Auth } from '../../auth/decorators/auth.decorator';

@Controller('example-upload')
export class FileUploadExampleController {
  private multerOptions: any;

  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly fileStorageService: FileStorageService,
  ) {
    // Инициализируем опции Multer в конструкторе
    this.multerOptions = this.fileUploadService.createMulterOptions({
      destination: 'uploads/pet-photos',
      maxSize: 5 * 1024 * 1024, // 5 MB
      prefix: 'pet-photo',
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    });
  }

  /**
   * Пример: Загрузка нескольких изображений для питомца
   * 
   * POST /example-upload/pet-photos/:petId
   * Content-Type: multipart/form-data
   * Body: files[] (массив файлов)
   */
  @Post('pet-photos/:petId')
  @Auth()
  // @ts-ignore - декораторы выполняются до инициализации класса
  @UseInterceptors(FilesInterceptor('files', 10, this.multerOptions))
  async uploadPetPhotos(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('petId') petId: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // Обрабатываем все загруженные файлы
    const uploadedFiles = this.fileUploadService.processUploadedFiles(files, {
      destination: 'uploads/pet-photos',
      prefix: 'pet-photo',
    });

    // Сохраняем метаданные в БД
    const savedFiles = await Promise.all(
      uploadedFiles.map((fileInfo) =>
        this.fileStorageService.saveFileMetadata({
          ...fileInfo,
          entityType: 'pet-photo',
          entityId: parseInt(petId),
        }),
      ),
    );

    return {
      success: true,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
      files: uploadedFiles.map((file) => ({
        id: savedFiles.find((s) => s.url === file.url)?.id,
        url: file.url,
        filename: file.filename,
        originalName: file.originalName,
        size: file.size,
        hash: file.hash,
      })),
    };
  }

  /**
   * Пример: Загрузка аватара пользователя
   * 
   * POST /example-upload/user-avatar
   * Content-Type: multipart/form-data
   * Body: file (один файл)
   */
  @Post('user-avatar')
  @Auth()
  // @ts-ignore - декораторы выполняются до инициализации класса, fileUploadService гарантированно инициализирован
  @UseInterceptors(
    FilesInterceptor(
      'file',
      1,
      ((this as any).fileUploadService.createMulterOptions({
        destination: 'uploads/user-avatars',
        maxSize: 2 * 1024 * 1024, // 2 MB
        prefix: 'avatar',
      }) as any),
    ),
  )
  async uploadUserAvatar(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No file uploaded');
    }

    const fileInfo = this.fileUploadService.processUploadedFile(files[0], {
      destination: 'uploads/user-avatars',
      prefix: 'avatar',
    });

    return {
      success: true,
      file: {
        url: fileInfo.url,
        filename: fileInfo.filename,
        hash: fileInfo.hash,
      },
    };
  }
}

