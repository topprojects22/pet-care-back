// src/grooming-record/dto/update-grooming-record.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateGroomingRecordDto } from './create-grooming-record.dto';

export class UpdateGroomingRecordDto extends PartialType(CreateGroomingRecordDto) {}