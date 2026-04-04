import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import {
  PrometheusModule,
  makeCounterProvider,
} from '@willsoto/nestjs-prometheus';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, PrometheusModule.register(), PrismaModule],
  controllers: [HealthController],
  providers: [
    makeCounterProvider({
      name: 'health_check_total',
      help: 'Total number of health check requests',
    }),
  ],
})
export class HealthModule {}
