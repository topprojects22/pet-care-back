import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ImageService } from './image.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Get('getImageByUserId')
  @Auth()
  async getImageByUserId(@CurrentUser('id') id: number) {
    return this.imageService.getImageByUserId(id);
  }

  @HttpCode(200)
  @Get('getAllImages')
  @Auth()
  async getAll() {
    return this.imageService.getAll();
  }
}
