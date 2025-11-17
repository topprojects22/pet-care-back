import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/**
 * Pipe для преобразования строки в число с плавающей точкой
 * 
 * @example
 * @Get('price/:amount')
 * async getByPrice(@Param('amount', ParseFloatPipe) amount: number) {
 *   return this.service.findByPrice(amount);
 * }
 */
@Injectable()
export class ParseFloatPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const val = parseFloat(value);
    if (isNaN(val)) {
      throw new BadRequestException(`Validation failed. "${value}" is not a number.`);
    }
    return val;
  }
}

