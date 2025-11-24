import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export interface UploadedFileInfo {
  filename: string;
  originalName: string;
  path: string;
  url: string;
  mimeType: string;
  size: number;
  hash: string;
}

export interface FileUploadConfig {
  destination?: string;
  maxSize?: number; // в байтах
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  prefix?: string; // префикс для имени файла
}

@Injectable()
export class FileUploadService {
  private readonly defaultMaxSize = 5 * 1024 * 1024; // 5 MB
  private readonly defaultAllowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  private readonly defaultAllowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  private readonly uploadsBasePath: string;

  constructor(private configService: ConfigService) {
    this.uploadsBasePath = process.cwd();
  }

  /**
   * Генерирует хеш для имени файла
   */
  private generateFileHash(buffer: Buffer, originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const content = `${timestamp}-${random}-${originalName}`;
    return createHash('sha256').update(content).digest('hex').substring(0, 16);
  }

  /**
   * Создает директорию, если она не существует
   */
  private ensureDirectoryExists(directory: string): void {
    if (!existsSync(directory)) {
      mkdirSync(directory, { recursive: true });
    }
  }

  /**
   * Валидирует файл
   */
  private validateFile(
    file: Express.Multer.File,
    config: FileUploadConfig,
  ): void {
    const maxSize = config.maxSize || this.defaultMaxSize;
    const allowedMimeTypes =
      config.allowedMimeTypes || this.defaultAllowedMimeTypes;
    const allowedExtensions =
      config.allowedExtensions || this.defaultAllowedExtensions;

    // Проверка размера
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
      );
    }

    // Проверка MIME типа
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`,
      );
    }

    // Проверка расширения
    const ext = extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      throw new BadRequestException(
        `File extension ${ext} is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`,
      );
    }
  }

  /**
   * Обрабатывает загруженный файл и возвращает информацию о нем
   */
  processUploadedFile(
    file: Express.Multer.File,
    config: FileUploadConfig = {},
  ): UploadedFileInfo {
    // Валидация
    this.validateFile(file, config);

    // Генерация хеша
    const hash = this.generateFileHash(file.buffer, file.originalname);
    const ext = extname(file.originalname).toLowerCase();
    const prefix = config.prefix || 'file';
    const filename = `${prefix}-${hash}${ext}`;

    // Формирование URL (относительно корня сервера)
    const relativePath = config.destination || 'uploads';
    const url = `/${relativePath}/${filename}`;

    return {
      filename,
      originalName: file.originalname,
      path: file.path,
      url,
      mimeType: file.mimetype,
      size: file.size,
      hash,
    };
  }

  /**
   * Обрабатывает несколько загруженных файлов
   */
  processUploadedFiles(
    files: Express.Multer.File[],
    config: FileUploadConfig = {},
  ): UploadedFileInfo[] {
    return files.map((file) => this.processUploadedFile(file, config));
  }

  /**
   * Создает конфигурацию Multer для загрузки файлов
   */
  createMulterOptions(config: FileUploadConfig = {}): MulterOptions {
    const destination = config.destination || 'uploads';
    const fullPath = `${this.uploadsBasePath}/${destination}`;

    // Создаем директорию, если не существует
    this.ensureDirectoryExists(fullPath);

    const maxSize = config.maxSize || this.defaultMaxSize;
    const allowedMimeTypes =
      config.allowedMimeTypes || this.defaultAllowedMimeTypes;
    const allowedExtensions =
      config.allowedExtensions || this.defaultAllowedExtensions;

    return {
      storage: diskStorage({
        destination: (req, file, callback) => {
          callback(null, fullPath);
        },
        filename: (req, file, callback) => {
          const hash = this.generateFileHash(
            Buffer.from(file.originalname),
            file.originalname,
          );
          const ext = extname(file.originalname).toLowerCase();
          const prefix = config.prefix || 'file';
          const filename = `${prefix}-${hash}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        const ext = extname(file.originalname).toLowerCase();
        if (
          !allowedMimeTypes.includes(file.mimetype) ||
          !allowedExtensions.includes(ext)
        ) {
          return callback(
            new BadRequestException(
              `File type ${file.mimetype} with extension ${ext} is not allowed`,
            ),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: maxSize,
      },
    };
  }

  /**
   * Удаляет файл с диска
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const fullPath = `${this.uploadsBasePath}/${filePath}`;
      if (existsSync(fullPath)) {
        await fs.unlink(fullPath);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to delete file: ${errorMessage}`,
      );
    }
  }
}

