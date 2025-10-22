// src/admission-vet-clinic/dto/update-admission-vet-clinic.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateAdmissionVetClinicDto } from './create-admission-vet-clinic.dto';

export class UpdateAdmissionVetClinicDto extends PartialType(CreateAdmissionVetClinicDto) {}