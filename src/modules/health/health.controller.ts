import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { PrismaService } from '@modules/prisma/prisma.service';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaIndicator: PrismaHealthIndicator,
    private readonly memoryIndicator: MemoryHealthIndicator,
    private readonly diskIndicator: DiskHealthIndicator,
    private readonly prisma: PrismaService,
    @InjectMetric('health_check_total')
    private readonly healthCheckCounter: Counter<string>,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Service health check' })
  check() {
    this.healthCheckCounter.inc();
    return this.health.check([
      () => this.prismaIndicator.pingCheck('database', this.prisma),
      () => this.memoryIndicator.checkHeap('memory_heap', 300 * 1024 * 1024), // 300MB
      () =>
        this.diskIndicator.checkStorage('disk', {
          path: '/',
          thresholdPercent: 0.9,
        }),
    ]);
  }

  @Public()
  @Get('live')
  @ApiOperation({ summary: 'Kubernetes liveness probe' })
  liveness(): { status: string } {
    return { status: 'ok' };
  }

  @Public()
  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Kubernetes readiness probe' })
  readiness() {
    return this.health.check([
      () => this.prismaIndicator.pingCheck('database', this.prisma),
    ]);
  }
}
