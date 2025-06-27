import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // "value" is an object containing the file's attributes and metadata

    if (metadata.data === 'id') {
      console.log(new metadata.metatype());
      return value;
    }

    const oneKb = 3000;
    return value.size < oneKb ? value : null;
  }
}
