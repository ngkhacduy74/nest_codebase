// import { Module, DynamicModule } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { EmailService } from './email.service';
// import { EMAIL_CONFIG_KEY, EmailConfig } from './email.interface';
// import { SendgridProvider } from './providers/sendgrid.provider';
// import { SesProvider } from './providers/ses.provider';
// import type { EmailProvider } from './email.interface';

// @Module({})
// export class EmailModule {
//   static forRoot(): DynamicModule {
//     return {
//       module: EmailModule,
//       providers: [
//         {
//           provide: EMAIL_CONFIG_KEY,
//           useFactory: (configService: ConfigService) => configService.get<EmailConfig>(EMAIL_CONFIG_KEY),
//           inject: [ConfigService],
//         },
//         {
//           provide: 'EmailProvider',
//           useFactory: (configService: ConfigService) => {
//             const emailConfig = configService.get<EmailConfig>(EMAIL_CONFIG_KEY)!;

//             switch (emailConfig.provider) {
//               case 'sendgrid':
//                 return new SendgridProvider(configService);
//               case 'ses':
//                 return new SesProvider(configService);
//               default:
//                 throw new Error(`Unsupported email provider: ${emailConfig.provider}`);
//             }
//           },
//           inject: [ConfigService],
//         },
//         EmailService,
//       ],
//       exports: [EmailService],
//     };
//   }

//   static forRootAsync(options: {
//     useFactory: (...args: any[]) => Promise<EmailConfig> | EmailConfig;
//     inject?: any[];
//   }): DynamicModule {
//     return {
//       module: EmailModule,
//       providers: [
//         {
//           provide: EMAIL_CONFIG_KEY,
//           useFactory: options.useFactory,
//           inject: options.inject || [],
//         },
//         {
//           provide: 'EmailProvider',
//           useFactory: (configService: ConfigService) => {
//             const emailConfig = configService.get<EmailConfig>(EMAIL_CONFIG_KEY)!;

//             switch (emailConfig.provider) {
//               case 'sendgrid':
//                 return new SendgridProvider(configService);
//               case 'ses':
//                 return new SesProvider(configService);
//               default:
//                 throw new Error(`Unsupported email provider: ${emailConfig.provider}`);
//             }
//           },
//           inject: [ConfigService],
//         },
//         EmailService,
//       ],
//       exports: [EmailService],
//     };
//   }
// }
