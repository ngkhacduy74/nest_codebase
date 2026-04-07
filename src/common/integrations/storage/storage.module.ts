// import { Module, DynamicModule } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { StorageService } from './storage.service';
// import { STORAGE_CONFIG_KEY, StorageConfig } from './storage.interface';
// import { AwsS3Provider } from './providers/aws-s3.provider';
// import type { StorageProvider } from './storage.interface';

// @Module({})
// export class StorageModule {
//   static forRoot(): DynamicModule {
//     return {
//       module: StorageModule,
//       providers: [
//         {
//           provide: STORAGE_CONFIG_KEY,
//           useFactory: (configService: ConfigService) => configService.get<StorageConfig>(STORAGE_CONFIG_KEY),
//           inject: [ConfigService],
//         },
//         {
//           provide: 'StorageProvider',
//           useFactory: (configService: ConfigService) => {
//             const storageConfig = configService.get<StorageConfig>(STORAGE_CONFIG_KEY)!;

//             switch (storageConfig.provider) {
//               case 'aws-s3':
//                 return new AwsS3Provider(configService);
//               default:
//                 throw new Error(`Unsupported storage provider: ${storageConfig.provider}`);
//             }
//           },
//           inject: [ConfigService],
//         },
//         StorageService,
//       ],
//       exports: [StorageService],
//     };
//   }

//   static forRootAsync(options: {
//     useFactory: (...args: any[]) => Promise<StorageConfig> | StorageConfig;
//     inject?: any[];
//   }): DynamicModule {
//     return {
//       module: StorageModule,
//       providers: [
//         {
//           provide: STORAGE_CONFIG_KEY,
//           useFactory: options.useFactory,
//           inject: options.inject || [],
//         },
//         {
//           provide: 'StorageProvider',
//           useFactory: (configService: ConfigService) => {
//             const storageConfig = configService.get<StorageConfig>(STORAGE_CONFIG_KEY)!;

//             switch (storageConfig.provider) {
//               case 'aws-s3':
//                 return new AwsS3Provider(configService);
//               default:
//                 throw new Error(`Unsupported storage provider: ${storageConfig.provider}`);
//             }
//           },
//           inject: [ConfigService],
//         },
//         StorageService,
//       ],
//       exports: [StorageService],
//     };
//   }
// }
