import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/**
 * Pipe для преобразования строки в число с валидацией
 * Используется для параметров маршрута
 * 
 * @example
 * @Get(':id')
 * async findOne(@Param('id', ParseIntPipe) id: number) {
 *   return this.service.findOne(id);
 * }
 */
@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException(`Validation failed. "${value}" is not an integer.`);
    }
    return val;
  }
}

