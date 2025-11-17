import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma.service';

/**
 * Health Check контроллер
 * Предоставляет endpoints для проверки состояния приложения
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Проверка состояния приложения' })
  check() {
    return this.health.check([
      () =>
        this.prismaHealth.pingCheck('database', this.prisma),
    ]);
  }

  @Get('liveness')
  @ApiOperation({ summary: 'Liveness probe для Kubernetes' })
  liveness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('readiness')
  @ApiOperation({ summary: 'Readiness probe для Kubernetes' })
  async readiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'not ready', timestamp: new Date().toISOString() };
    }
  }
}

