import { Module, Global } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createWinstonConfig } from './winston.config';
import loggerConfig from '../../config/logger.config';

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: createWinstonConfig,
    }),
    ConfigModule.forFeature(loggerConfig),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}

