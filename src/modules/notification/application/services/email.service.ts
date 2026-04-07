import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectMetric('email_sent_total')
    private readonly emailCounter: Counter<string>,
  ) {}

  async send(
    to: string,
    subject: string,
    template: string,
    context: any,
  ): Promise<any> {
    this.logger.log(
      `[Email] Sending email to ${to}: ${subject} (template: ${template})`,
    );
    this.emailCounter.inc({ provider: 'simulated', status: 'success' });
    return { success: true, messageId: `msg-${Date.now()}` };
  }

  async sendWelcomeEmail(to: string, firstName: string): Promise<any> {
    const subject = 'Welcome to our platform!';
    this.logger.log(`[Email] Sending welcome email to ${to}`);
    this.emailCounter.inc({ provider: 'simulated', status: 'success' });
    return { success: true, messageId: `welcome-${Date.now()}` };
  }

  async sendAccountUpdateEmail(
    to: string,
    firstName: string,
    changes: any,
  ): Promise<any> {
    const subject = 'Your account was updated';
    this.logger.log(`[Email] Sending account update email to ${to}`);
    this.emailCounter.inc({ provider: 'simulated', status: 'success' });
    return { success: true, messageId: `update-${Date.now()}` };
  }

  async sendPasswordReset(to: string, token: string): Promise<any> {
    const subject = 'Password Reset Request';
    this.logger.log(`[Email] Sending password reset email to ${to}`);
    this.emailCounter.inc({ provider: 'simulated', status: 'success' });
    return { success: true, messageId: `reset-${Date.now()}` };
  }
}
