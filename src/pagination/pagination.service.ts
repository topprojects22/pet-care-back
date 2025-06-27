import { Injectable } from '@nestjs/common';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class PaginationService {
  getPagination(paginationDto: PaginationDto, defaultPerPage = 30) {
    const page = paginationDto.page ? +paginationDto.page : 1;
    const perPage = paginationDto.perPage
      ? +paginationDto.perPage
      : defaultPerPage;
    const skip = (page - 1) * perPage;
    return { perPage, skip };
  }
}
