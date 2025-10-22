// src/pet-passport/services/passport-pdf-generator.service.ts
import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { PetPassport } from '@prisma/client';

@Injectable()
export class PassportPdfGeneratorService {
    async generatePdf(passport: any): Promise<Buffer> {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks: Buffer[] = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => {});

        // Заголовок
        doc.fontSize(24).text('ПАСПОРТ ПИТОМЦА', { align: 'center' });
        doc.moveDown();

        // Основные данные
        doc.fontSize(12);
        doc.text(`Имя: ${passport.pet.name}`);
        doc.text(`Чип: ${passport.chip}`);
        doc.text(`Порода: ${passport.breed?.name || 'Не указана'}`);
        doc.text(`Владелец: ${passport.pet.user.name} ${passport.pet.user.lastName}`);
        doc.text(`Телефон: ${passport.pet.user.phone}`);

        if (passport.vaccinationHistory) {
            doc.moveDown();
            doc.text('Прививки:');
            const vaccines = JSON.parse(passport.vaccinationHistory as string);
            vaccines.forEach(v => doc.text(`- ${v.name}: ${v.date}`));
        }

        // QR-код (можно вставить как изображение)
        // Для упрощения — просто текст
        doc.moveDown();
        doc.text(`QR: ${passport.qrCode}`);

        doc.end();

        return new Promise(resolve => {
            doc.on('finish', () => resolve(Buffer.concat(chunks)));
        });
    }
}