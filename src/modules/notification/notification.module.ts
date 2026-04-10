import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationListener } from './infrastructure/notification.listener';
import { EmailProcessor } from './infrastructure/email.processor';
import { EmailService } from './application/services/email.service';
import { MetricsModule } from '@modules/metrics/metrics.module';
import { NOTIFICATION_QUEUE_NAME } from './notification.constants';

@Module({
  imports: [
    MetricsModule,
    BullModule.registerQueue({
      name: NOTIFICATION_QUEUE_NAME,
    }),
  ],
  providers: [NotificationListener, EmailProcessor, EmailService],
  exports: [EmailService],
})
export class NotificationModule {}
