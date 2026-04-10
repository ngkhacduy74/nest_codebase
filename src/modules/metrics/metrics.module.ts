import { Module } from '@nestjs/common';
import {
  PrometheusModule,
  makeCounterProvider,
  makeGaugeProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';

const healthCheckCounter = makeCounterProvider({
  name: 'health_check_total',
  help: 'Total number of health checks performed',
});

const userRegistrationsCounter = makeCounterProvider({
  name: 'user_registrations_total',
  help: 'Total number of a new user registrations',
});

const activeSessionsGauge = makeGaugeProvider({
  name: 'active_sessions_total',
  help: 'Number of active user sessions in Redis',
});

const emailSentCounter = makeCounterProvider({
  name: 'email_sent_total',
  help: 'Total number of emails sent',
  labelNames: ['provider', 'status'],
});

const cacheHitsCounter = makeCounterProvider({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
});

const cacheMissesCounter = makeCounterProvider({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
});

const queueJobDurationHistogram = makeHistogramProvider({
  name: 'queue_job_duration_seconds',
  help: 'Duration of queue jobs in seconds',
  labelNames: ['queue', 'job'],
});

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  providers: [
    healthCheckCounter,
    userRegistrationsCounter,
    activeSessionsGauge,
    emailSentCounter,
    cacheHitsCounter,
    cacheMissesCounter,
    queueJobDurationHistogram,
  ],
  exports: [
    PrometheusModule,
    healthCheckCounter,
    userRegistrationsCounter,
    activeSessionsGauge,
    emailSentCounter,
    cacheHitsCounter,
    cacheMissesCounter,
    queueJobDurationHistogram,
  ],
})
export class MetricsModule {}
