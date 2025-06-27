import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  Headers,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles-auth.gecorator';
import { RolesGuard } from '../auth/decorators/roles.guard';
import {
  AnyFilesInterceptor,
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { ImageService } from '../image/image.service';
import { FileSizeValidationPipe } from './pipe/file-size.pipe';
import { JwtService } from '@nestjs/jwt';

@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FilesService,
    private readonly imageService: ImageService,
    private readonly jwt: JwtService,
  ) {}

  @Roles('user')
  @UseGuards(RolesGuard)
  @UsePipes(new FileSizeValidationPipe())
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Headers() headers: any,
  ) {
    const userInfoFromToken: any = this.jwt.decode(
      headers.authorization.split(' ', 2)[1],
    );
    await this.imageService.createImage(userInfoFromToken.id, file.filename);
  }

  @Roles('admin')
  @UseGuards(RolesGuard)
  @Post('uploadList')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFileList(@UploadedFiles() files: Array<Express.Multer.File>) {
    console.log(files);
  }

  @Post('uploadMultiple')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'background', maxCount: 1 },
    ]),
  )
  async uploadMultipleFile(
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
      background?: Express.Multer.File[];
    },
  ) {
    console.log(files);
  }

  // @Post('upload')
  // @UseInterceptors(AnyFilesInterceptor())
  // async uploadAnyFile(@UploadedFiles() files: Array<Express.Multer.File>) {
  //   console.log(files);
  // }
}
