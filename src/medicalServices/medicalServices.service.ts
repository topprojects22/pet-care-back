import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import {
  CreateAppointmentDto,
} from "./dto/medical-services.dto";
import { ClinicSearchDto } from "./dto/clinic-search.dto";
import { createPaginatedResponse } from "../common/utils/response.util";

@Injectable()
export class MedicalServicesService {
  constructor(private prisma: PrismaService) {}

  // Получение списка клиник с оптимизацией и пагинацией
  async getAllClinics(searchParams: ClinicSearchDto) {
    const { page = 1, limit = 20, name, specialty, emergencyService, minRating, city } = searchParams;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }

    if (city) {
      where.address = { contains: city, mode: 'insensitive' };
    }

    if (emergencyService !== undefined) {
      where.emergencyService = emergencyService;
    }

    if (minRating !== undefined) {
      where.rating = { gte: minRating };
    }

    // Оптимизированный запрос с select и пагинацией
    const [clinics, total] = await Promise.all([
      this.prisma.clinic.findMany({
        where,
        select: {
          id: true,
          name: true,
          address: true,
          phone: true,
          email: true,
          rating: true,
          emergencyService: true,
          workingHours: true,
          _count: {
            select: {
              service: true,
              admissionVetClinic: true,
            },
          },
        },
        orderBy: [
          { rating: 'desc' },
          { name: 'asc' },
        ],
        skip,
        take: limit,
      }),
      this.prisma.clinic.count({ where }),
    ]);

    return createPaginatedResponse(clinics, page, limit, total);
  }

  // Получение деталей клиники
  async getClinicDetails(id: number) {
    return this.prisma.clinic.findUnique({
      where: { id },
      include: {
        service: true,
        staff: true,
        admissionVetClinic: {
          include: {
            pet: true,
          },
          orderBy: { visitDate: "desc" },
          take: 10,
        },
      },
    });
  }

  // Запись на прием в клинику
  async createClinicAppointment(appointmentData: CreateAppointmentDto) {
    return this.prisma.admissionVetClinic.create({
      data: {
        pet: { connect: { id: appointmentData.petId } },
        clinic: { connect: { id: appointmentData.clinicId } },
        status: "SCHEDULED",
        procedure: appointmentData.procedure,
        description: appointmentData.description,
        diagnosis: appointmentData.diagnosis,
        recomendation: appointmentData.recomendation,
        visitDate: appointmentData.visitDate,
        nextVisitDate: appointmentData.nextVisitDate,
        doctorName: appointmentData.doctorName,
        medications: appointmentData.medications,
        cost: appointmentData.cost ?? 0,
        files: appointmentData.files,
        temperature: appointmentData.temperature,
        pulse: appointmentData.pulse,
        respiration: appointmentData.respiration,
        weight: appointmentData.weight,
        anesthesia: appointmentData.anesthesia,
        complications: appointmentData.complications,
      },
    });
  }

  // Получение истории посещений питомца
  async getPetClinicHistory(petId: number) {
    return this.prisma.admissionVetClinic.findMany({
      where: { petId },
      include: {
        clinic: true,
      },
      orderBy: { visitDate: "desc" },
    });
  }

  // Получение деталей посещения
  async getAppointmentDetails(id: number) {
    return this.prisma.admissionVetClinic.findUnique({
      where: { id },
      include: {
        clinic: true,
        pet: true,
      },
    });
  }
}
