import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class PassportPdfService {
  constructor(private prisma: PrismaService) {}

  /**
   * Генерирует PDF паспорт питомца и возвращает Buffer
   */
  async generatePassportPdf(
    petId: number,
    includeHistory: boolean = true,
    includeVaccinations: boolean = true,
  ): Promise<Buffer> {
    // Получаем данные питомца с паспортом
    const pet = await this.prisma.pet.findUnique({
      where: { id: petId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        animalType: true,
        petPassport: {
          include: {
            breed: true,
          },
        },
        vaccinations: includeVaccinations
          ? {
              include: {
                clinic: {
                  select: {
                    id: true,
                    name: true,
                    address: true,
                  },
                },
              },
              orderBy: { date: 'desc' },
            }
          : false,
        admissionVetClinic: includeHistory
          ? {
              include: {
                clinic: {
                  select: {
                    id: true,
                    name: true,
                    address: true,
                  },
                },
              },
              orderBy: { visitDate: 'desc' },
              take: 20, // Ограничиваем количество записей
            }
          : false,
      },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    if (!pet.petPassport) {
      throw new NotFoundException('Pet passport not found');
    }

    const passport = pet.petPassport;

    // Создаем PDF документ
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      },
    });

    // Собираем PDF в Buffer
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    
    return new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      doc.on('error', reject);

      // Заголовок документа
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('ВЕТЕРИНАРНЫЙ ПАСПОРТ', { align: 'center' })
        .moveDown(2);

        // Информация о питомце
        doc.fontSize(14).font('Helvetica-Bold').text('Информация о питомце:');
        doc.fontSize(12).font('Helvetica');
        doc.text(`Имя: ${pet.name}`, { indent: 20 });
        if (pet.animalType) {
          doc.text(`Вид: ${pet.animalType.name}`, { indent: 20 });
        }
        if (passport.breed) {
          doc.text(`Порода: ${passport.breed.name}`, { indent: 20 });
        }
        if (pet.birthDate) {
          doc.text(
            `Дата рождения: ${new Date(pet.birthDate).toLocaleDateString('ru-RU')}`,
            { indent: 20 },
          );
        }
        if (pet.gender) {
          doc.text(`Пол: ${pet.gender}`, { indent: 20 });
        }
        if (pet.color) {
          doc.text(`Окрас: ${pet.color}`, { indent: 20 });
        }
        if (pet.weight) {
          doc.text(`Вес: ${pet.weight} кг`, { indent: 20 });
        }
        doc.moveDown();

        // Информация о паспорте
        doc.fontSize(14).font('Helvetica-Bold').text('Данные паспорта:');
        doc.fontSize(12).font('Helvetica');
        doc.text(`Чип: ${passport.chip}`, { indent: 20 });
        if (passport.chipInstallDate) {
          doc.text(
            `Дата установки чипа: ${new Date(passport.chipInstallDate).toLocaleDateString('ru-RU')}`,
            { indent: 20 },
          );
        }
        if (passport.tattooNumber) {
          doc.text(`Татуировка: ${passport.tattooNumber}`, { indent: 20 });
        }
        if (passport.registrationNumber) {
          doc.text(
            `Регистрационный номер: ${passport.registrationNumber}`,
            { indent: 20 },
          );
        }
        if (passport.issuingOrganization) {
          doc.text(
            `Организация, выдавшая паспорт: ${passport.issuingOrganization}`,
            { indent: 20 },
          );
        }
        if (passport.specialMarks) {
          doc.text(`Особые приметы: ${passport.specialMarks}`, {
            indent: 20,
          });
        }
        doc.moveDown();

        // Информация о владельце
        if (pet.user) {
          doc.fontSize(14).font('Helvetica-Bold').text('Владелец:');
          doc.fontSize(12).font('Helvetica');
          if (pet.user.name) {
            doc.text(`Имя: ${pet.user.name}`, { indent: 20 });
          }
          if (pet.user.lastName) {
            doc.text(`Фамилия: ${pet.user.lastName}`, { indent: 20 });
          }
          if (pet.user.email) {
            doc.text(`Email: ${pet.user.email}`, { indent: 20 });
          }
          if (pet.user.phone) {
            doc.text(`Телефон: ${pet.user.phone}`, { indent: 20 });
          }
          if (pet.user.address) {
            doc.text(`Адрес: ${pet.user.address}`, { indent: 20 });
          }
          doc.moveDown();
        }

        // История вакцинаций
        if (includeVaccinations && pet.vaccinations && pet.vaccinations.length > 0) {
          doc.addPage();
          doc.fontSize(14).font('Helvetica-Bold').text('История вакцинаций:');
          doc.moveDown(0.5);

          pet.vaccinations.forEach((vaccination, index) => {
            doc.fontSize(12).font('Helvetica-Bold').text(`${index + 1}. ${vaccination.name}`);
            doc.fontSize(11).font('Helvetica');
            doc.text(
              `Дата: ${new Date(vaccination.date).toLocaleDateString('ru-RU')}`,
              { indent: 20 },
            );
            if (vaccination.nextDate) {
              doc.text(
                `Следующая вакцинация: ${new Date(vaccination.nextDate).toLocaleDateString('ru-RU')}`,
                { indent: 20 },
              );
            }
            if ('clinic' in vaccination && vaccination.clinic) {
              doc.text(`Клиника: ${vaccination.clinic.name}`, { indent: 20 });
            }
            if (vaccination.description) {
              doc.text(`Описание: ${vaccination.description}`, { indent: 20 });
            }
            doc.moveDown(0.5);
          });
        }

        // История визитов
        if (includeHistory && pet.admissionVetClinic && pet.admissionVetClinic.length > 0) {
          doc.addPage();
          doc.fontSize(14).font('Helvetica-Bold').text('История визитов в клинику:');
          doc.moveDown(0.5);

          pet.admissionVetClinic.forEach((visit, index) => {
            doc.fontSize(12).font('Helvetica-Bold').text(
              `${index + 1}. ${visit.procedure || 'Визит'}`,
            );
            doc.fontSize(11).font('Helvetica');
            doc.text(
              `Дата: ${new Date(visit.visitDate).toLocaleDateString('ru-RU')}`,
              { indent: 20 },
            );
            if ('clinic' in visit && visit.clinic) {
              doc.text(`Клиника: ${visit.clinic.name}`, { indent: 20 });
            }
            if (visit.doctorName) {
              doc.text(`Врач: ${visit.doctorName}`, { indent: 20 });
            }
            if (visit.diagnosis) {
              doc.text(`Диагноз: ${visit.diagnosis}`, { indent: 20 });
            }
            if (visit.description) {
              doc.text(`Описание: ${visit.description}`, { indent: 20 });
            }
            if (visit.cost) {
              doc.text(`Стоимость: ${visit.cost} руб.`, { indent: 20 });
            }
            doc.moveDown(0.5);
          });
        }

        // Подпись и дата
        doc.moveDown(2);
        doc.fontSize(10).font('Helvetica').text(
          `Документ сгенерирован: ${new Date().toLocaleDateString('ru-RU')}`,
          { align: 'right' },
        );

        // Завершаем документ
        doc.end();
    });
  }
}

