import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';
import { PaginationModule } from './pagination/pagination.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PetModule } from './pet/pet.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      serveRoot: '../public',
      rootPath: join(__dirname, '../public'),
      exclude: ['/api*'],
    }),
    UserModule,
    AuthModule,
    PaginationModule,
    PetModule
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
