// import { Module, DynamicModule } from '@nestjs/common';
// import { EmailModule } from './email/email.module';
// import { StorageModule } from './storage/storage.module';

// export interface IntegrationsModuleOptions {
//   email?: boolean;
//   storage?: boolean;
// }

// @Module({})
// export class IntegrationsModule {
//   static forRoot(options: IntegrationsModuleOptions = {}): DynamicModule {
//     const modules: DynamicModule[] = [];

//     if (options.email !== false) {
//       modules.push(EmailModule.forRoot());
//     }

//     if (options.storage !== false) {
//       modules.push(StorageModule.forRoot());
//     }

//     return {
//       module: IntegrationsModule,
//       imports: modules,
//       exports: modules,
//     };
//   }

//   static forRootAsync(
//     emailOptions?: {
//       useFactory: (...args: any[]) => Promise<any> | any;
//       inject?: any[];
//     },
//     storageOptions?: {
//       useFactory: (...args: any[]) => Promise<any> | any;
//       inject?: any[];
//     },
//   ): DynamicModule {
//     const modules: DynamicModule[] = [];

//     if (emailOptions) {
//       modules.push(EmailModule.forRootAsync(emailOptions));
//     }

//     if (storageOptions) {
//       modules.push(StorageModule.forRootAsync(storageOptions));
//     }

//     return {
//       module: IntegrationsModule,
//       imports: modules,
//       exports: modules,
//     };
//   }
// }
