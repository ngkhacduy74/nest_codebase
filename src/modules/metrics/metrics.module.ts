import { Module } from '@nestjs/common';
import { PrometheusModule, makeCounterProvider, makeGaugeProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';

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
    makeCounterProvider({
      name: 'health_check_total',
      help: 'Total number of health checks performed',
    }),
    makeCounterProvider({
      name: 'user_registrations_total',
      help: 'Total number of a new user registrations',
    }),
    makeGaugeProvider({
      name: 'active_sessions_total',
      help: 'Number of active user sessions in Redis',
    }),
    makeCounterProvider({
      name: 'email_sent_total',
      help: 'Total number of emails sent',
      labelNames: ['provider', 'status'],
    }),
    makeCounterProvider({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
    }),
    makeCounterProvider({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
    }),
    makeHistogramProvider({
      name: 'queue_job_duration_seconds',
      help: 'Duration of queue jobs in seconds',
      labelNames: ['queue', 'job'],
    }),
  ],
  exports: [PrometheusModule],
})
export class MetricsModule {}
