import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import {
  ClinicSearchDto,
  CreateAppointmentDto,
} from "./dto/medical-services.dto";

@Injectable()
export class MedicalServicesService {
  constructor(private prisma: PrismaService) {}

  // Получение списка клиник
  async getAllClinics(searchParams: ClinicSearchDto) {
    return this.prisma.clinic.findMany({
      where: {
        name: { contains: searchParams.name, mode: "insensitive" },
        // TODO Разобраться с поиском по специальностям
        // specialties: { contains: searchParams.specialty, mode: "insensitive" },
        emergencyService: searchParams.emergencyService,
        rating: { gte: searchParams.minRating },
      },
      include: {
        service: true,
        admissionVetClinic: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
    });
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
        cost: appointmentData.cost,
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
