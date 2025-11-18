import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

export interface FileStorageMetadata {
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  hash: string;
  entityType: string; // 'pet-photo', 'user-avatar', 'community-post', etc.
  entityId?: number; // ID связанной сущности
  metadata?: Record<string, any>; // Дополнительные метаданные
}

@Injectable()
export class FileStorageService {
  constructor(private prisma: PrismaService) {}

  /**
   * Сохраняет информацию о файле в БД
   * В будущем можно создать отдельную таблицу FileStorage
   * Пока используем существующие таблицы (PetPhoto и т.д.)
   */
  async saveFileMetadata(metadata: FileStorageMetadata): Promise<any> {
    // В зависимости от entityType сохраняем в соответствующую таблицу
    switch (metadata.entityType) {
      case 'pet-photo':
        return this.prisma.petPhoto.create({
          data: {
            url: metadata.url,
            petId: metadata.entityId!,
            isPrimary: metadata.metadata?.isPrimary || false,
          },
        });

      // Можно расширить для других типов
      default:
        // Для универсального использования можно создать таблицу FileStorage
        // Пока возвращаем метаданные
        return metadata;
    }
  }

  /**
   * Получает информацию о файле по хешу
   */
  async getFileByHash(hash: string, entityType: string): Promise<any> {
    // Реализация зависит от структуры БД
    // Можно создать универсальную таблицу FileStorage
    return null;
  }

  /**
   * Удаляет информацию о файле из БД
   */
  async deleteFileMetadata(id: number, entityType: string): Promise<void> {
    switch (entityType) {
      case 'pet-photo':
        await this.prisma.petPhoto.delete({ where: { id } });
        break;
      // Можно расширить для других типов
    }
  }
}

