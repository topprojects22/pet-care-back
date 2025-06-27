import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { MulterModule } from '@nestjs/platform-express';
import { ImageService } from '../image/image.service';
import { PrismaService } from '../prisma.service';
import { FileController } from './files.controller';
import { JwtService } from '@nestjs/jwt';
import { diskStorage } from 'multer';

@Module({
  providers: [FilesService, ImageService, PrismaService, JwtService],
  exports: [FilesService],
  controllers: [FileController],
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './upload',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  ],
})
export class FilesModule {}
