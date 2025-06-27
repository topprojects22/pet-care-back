import { Module } from '@nestjs/common';
import { PaginationService } from './pagination.service';

@Module({
  controllers: [],
  exports: [PaginationService],
  providers: [PaginationService],
})
export class PaginationModule {}
