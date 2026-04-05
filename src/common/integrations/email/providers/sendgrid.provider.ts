// import { Injectable, Inject } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { MailService } from '@sendgrid/mail';
// import { BaseProvider } from '../../../shared/integrations/base.provider';
// import type { EmailProvider, EmailMessage, EmailSendResult, EmailConfig } from '../email.interface';
// import { EMAIL_CONFIG_KEY } from '../email.interface';

// @Injectable()
// export class SendgridProvider extends BaseProvider implements EmailProvider {
//   private readonly mailService: MailService;

//   constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
//     super('SendGrid');
    
//     const emailConfig = this.configService.get<EmailConfig>(EMAIL_CONFIG_KEY)!;
    
//     this.mailService = new MailService();
//     this.mailService.setApiKey(emailConfig.sendgrid!.apiKey);
//   }

//   async send(message: EmailMessage): Promise<EmailSendResult> {
//     try {
//       this.logOperation('send', { to: message.to, subject: message.subject });
      
//       const emailConfig = this.configService.get<EmailConfig>(EMAIL_CONFIG_KEY)!;
      
//       const content = [
//         ...(message.html ? [{ type: 'text/html' as const, value: message.html }] : []),
//         ...(message.text ? [{ type: 'text/plain' as const, value: message.text }] : [])
//       ];
      
//       if (content.length === 0) {
//         throw new Error('Email must have either html or text content');
//       }

//       const msg = {
//         to: Array.isArray(message.to) ? message.to : [message.to],
//         cc: message.cc ? (Array.isArray(message.cc) ? message.cc : [message.cc]) : undefined,
//         bcc: message.bcc ? (Array.isArray(message.bcc) ? message.bcc : [message.bcc]) : undefined,
//         from: message.from || `${emailConfig.sendgrid!.fromName} <${emailConfig.sendgrid!.fromEmail}>`,
//         subject: message.subject,
//         content,
//         attachments: message.attachments?.map(att => ({
//           filename: att.filename,
//           content: att.content instanceof Buffer ? att.content.toString('base64') : String(att.content),
//           type: att.contentType,
//           disposition: 'attachment',
//         })),
//       };

//       const [response] = await this.mailService.send(msg as any);

//       this.logOperation('send success', { messageId: response.headers['x-message-id'] });

//       return {
//         success: true,
//         messageId: response.headers['x-message-id'],
//         providerResponse: {
//           statusCode: response.statusCode,
//           headers: response.headers,
//         },
//       };
//     } catch (error) {
//       return this.createErrorResult(error, 'send') as EmailSendResult;
//     }
//   }

//   async sendTemplate(message: EmailMessage): Promise<EmailSendResult> {
//     try {
//       this.logOperation('sendTemplate', { to: message.to, templateId: message.template?.templateId });
      
//       const emailConfig = this.configService.get<EmailConfig>(EMAIL_CONFIG_KEY)!;
      
//       const msg = {
//         to: Array.isArray(message.to) ? message.to : [message.to],
//         from: message.from || `${emailConfig.sendgrid!.fromName} <${emailConfig.sendgrid!.fromEmail}>`,
//         templateId: message.template!.templateId,
//         dynamicTemplateData: message.template!.templateData,
//       };

//       const [response] = await this.mailService.send(msg);

//       this.logOperation('sendTemplate success', { messageId: response.headers['x-message-id'] });

//       return {
//         success: true,
//         messageId: response.headers['x-message-id'],
//         providerResponse: {
//           statusCode: response.statusCode,
//           headers: response.headers,
//         },
//       };
//     } catch (error) {
//       return this.createErrorResult(error, 'sendTemplate') as EmailSendResult;
//     }
//   }

//   getProviderName(): string {
//     return 'SendGrid';
//   }

//   async validateConfig(): Promise<boolean> {
//     try {
//       const emailConfig = this.configService.get<EmailConfig>(EMAIL_CONFIG_KEY)!;
      
//       if (!emailConfig.sendgrid?.apiKey) {
//         return false;
//       }

//       // Basic validation - check if API key is non-empty and properly formatted
//       // SendGrid API keys start with "SG."
//       const apiKey = emailConfig.sendgrid.apiKey;
//       if (!apiKey || typeof apiKey !== 'string' || !apiKey.startsWith('SG.')) {
//         return false;
//       }

//       return true;
//     } catch {
//       return false;
//     }
//   }
// }
