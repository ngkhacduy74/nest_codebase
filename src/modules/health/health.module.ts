import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { MetricsModule } from '@modules/metrics/metrics.module';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, MetricsModule, PrismaModule],
  controllers: [HealthController],
  providers: [],
})
export class HealthModule {}
