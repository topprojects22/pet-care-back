import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodeService {
  constructor(private configService: ConfigService) {}

  /**
   * Генерирует QR-код для паспорта питомца
   * @param petId ID питомца
   * @param chip Номер чипа
   * @returns Buffer с изображением QR-кода в формате PNG
   */
  async generateQrCode(petId: number, chip: string): Promise<Buffer> {
    const baseUrl = this.configService.get<string>('APP_URL') || 'http://localhost:5000';
    const apiPrefix = this.configService.get<string>('app.apiPrefix', 'api');
    
    // URL для доступа к паспорту через QR-код
    const qrData = `${baseUrl}/${apiPrefix}/pet/${petId}/passport?chip=${chip}`;
    
    try {
      // Генерируем QR-код как PNG buffer
      const qrCodeBuffer = await QRCode.toBuffer(qrData, {
        type: 'png',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      
      return qrCodeBuffer;
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  /**
   * Генерирует QR-код как Data URL (для встраивания в HTML/PDF)
   * @param petId ID питомца
   * @param chip Номер чипа
   * @returns Data URL строку
   */
  async generateQrCodeDataUrl(petId: number, chip: string): Promise<string> {
    const baseUrl = this.configService.get<string>('APP_URL') || 'http://localhost:5000';
    const apiPrefix = this.configService.get<string>('app.apiPrefix', 'api');
    
    const qrData = `${baseUrl}/${apiPrefix}/pet/${petId}/passport?chip=${chip}`;
    
    try {
      const dataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      
      return dataUrl;
    } catch (error) {
      throw new Error(`Failed to generate QR code data URL: ${error.message}`);
    }
  }
}

