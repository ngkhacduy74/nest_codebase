// import { Injectable, Inject } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import {
//   S3Client,
//   PutObjectCommand,
//   GetObjectCommand,
//   DeleteObjectCommand,
//   ListObjectsV2Command,
//   HeadObjectCommand,
// } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import { Readable } from 'stream';
// import { BaseProvider } from '../../../shared/integrations/base.provider';
// import type {
//   StorageProvider,
//   StorageUploadOptions,
//   StorageUploadResult,
//   StorageDownloadResult,
//   StorageDeleteResult,
//   StorageListResult,
//   StorageConfig,
// } from '../storage.interface';
// import { STORAGE_CONFIG_KEY } from '../storage.interface';

// @Injectable()
// export class AwsS3Provider extends BaseProvider implements StorageProvider {
//   private readonly s3Client: S3Client;
//   private readonly bucket: string;

//   constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
//     super('AWS S3');
    
//     const storageConfig = this.configService.get<StorageConfig>(STORAGE_CONFIG_KEY)!;
    
//     this.s3Client = new S3Client({
//       region: storageConfig.awsS3!.region,
//       credentials: {
//         accessKeyId: storageConfig.awsS3!.accessKeyId,
//         secretAccessKey: storageConfig.awsS3!.secretAccessKey,
//       },
//       endpoint: storageConfig.awsS3!.endpoint,
//       forcePathStyle: storageConfig.awsS3!.forcePathStyle || false,
//     });
    
//     this.bucket = storageConfig.awsS3!.bucket;
//   }

//   async upload(key: string, buffer: Buffer | Readable, options?: StorageUploadOptions): Promise<StorageUploadResult> {
//     try {
//       this.logOperation('upload', { key, size: buffer instanceof Buffer ? buffer.length : 'stream' });
      
//       const command = new PutObjectCommand({
//         Bucket: this.bucket,
//         Key: key,
//         Body: buffer,
//         ContentType: options?.contentType,
//         Metadata: options?.metadata,
//         ACL: options?.isPublic ? 'public-read' : 'private',
//         Expires: options?.expiresAt,
//       });

//       const response = await this.s3Client.send(command);

//       this.logOperation('upload success', { key, etag: response.ETag });

//       return {
//         success: true,
//         key,
//         url: `https://${this.bucket}.s3.${this.configService.get('AWS_S3_REGION')}.${this.configService.get('AWS_S3_DOMAIN', 'amazonaws.com')}/${key}`,
//         etag: response.ETag,
//         providerResponse: {
//           ETag: response.ETag,
//           RequestId: response.$metadata.requestId,
//         },
//       };
//     } catch (error) {
//       return this.createErrorResult(error, 'upload') as StorageUploadResult;
//     }
//   }

//   async download(key: string): Promise<StorageDownloadResult> {
//     try {
//       this.logOperation('download', { key });
      
//       const command = new GetObjectCommand({
//         Bucket: this.bucket,
//         Key: key,
//       });

//       const response = await this.s3Client.send(command);

//       this.logOperation('download success', { key, size: response.ContentLength });

//       return {
//         success: true,
//         stream: response.Body as Readable,
//         contentType: response.ContentType,
//         size: response.ContentLength,
//         providerResponse: {
//           ETag: response.ETag,
//           RequestId: response.$metadata.requestId,
//         },
//       };
//     } catch (error) {
//       return this.createErrorResult(error, 'download') as StorageDownloadResult;
//     }
//   }

//   async delete(key: string): Promise<StorageDeleteResult> {
//     try {
//       this.logOperation('delete', { key });
      
//       const command = new DeleteObjectCommand({
//         Bucket: this.bucket,
//         Key: key,
//       });

//       const response = await this.s3Client.send(command);

//       this.logOperation('delete success', { key });

//       return {
//         success: true,
//         providerResponse: {
//           RequestId: response.$metadata.requestId,
//         },
//       };
//     } catch (error) {
//       return this.createErrorResult(error, 'delete') as StorageDeleteResult;
//     }
//   }

//   async list(prefix?: string, maxKeys?: number): Promise<StorageListResult> {
//     try {
//       this.logOperation('list', { prefix, maxKeys });
      
//       const command = new ListObjectsV2Command({
//         Bucket: this.bucket,
//         Prefix: prefix,
//         MaxKeys: maxKeys,
//       });

//       const response = await this.s3Client.send(command);

//       this.logOperation('list success', { count: response.Contents?.length });

//       return {
//         success: true,
//         files: response.Contents?.map(obj => ({
//           key: obj.Key!,
//           size: obj.Size!,
//           lastModified: obj.LastModified!,
//           etag: obj.ETag,
//         })),
//         providerResponse: {
//           RequestId: response.$metadata.requestId,
//         },
//       };
//     } catch (error) {
//       return this.createErrorResult(error, 'list') as StorageListResult;
//     }
//   }

//   async getSignedUrl(key: string, expiresIn: number): Promise<string> {
//     try {
//       this.logOperation('getSignedUrl', { key, expiresIn });
      
//       const command = new GetObjectCommand({
//         Bucket: this.bucket,
//         Key: key,
//       });

//       const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      
//       this.logOperation('getSignedUrl success', { key });
      
//       return url;
//     } catch (error) {
//       this.logError('getSignedUrl', error);
//       throw error;
//     }
//   }

//   async exists(key: string): Promise<boolean> {
//     try {
//       const command = new HeadObjectCommand({
//         Bucket: this.bucket,
//         Key: key,
//       });

//       await this.s3Client.send(command);
//       return true;
//     } catch {
//       return false;
//     }
//   }

//   async getMetadata(key: string): Promise<{
//     size: number;
//     contentType?: string;
//     lastModified: Date;
//     etag?: string;
//   } | null> {
//     try {
//       const command = new HeadObjectCommand({
//         Bucket: this.bucket,
//         Key: key,
//       });

//       const response = await this.s3Client.send(command);

//       return {
//         size: response.ContentLength!,
//         contentType: response.ContentType,
//         lastModified: response.LastModified!,
//         etag: response.ETag,
//       };
//     } catch {
//       return null;
//     }
//   }

//   getProviderName(): string {
//     return 'AWS S3';
//   }

//   async validateConfig(): Promise<boolean> {
//     try {
//       const storageConfig = this.configService.get<StorageConfig>(STORAGE_CONFIG_KEY)!;
      
//       if (!storageConfig.awsS3?.accessKeyId || !storageConfig.awsS3?.secretAccessKey || !storageConfig.awsS3?.bucket) {
//         return false;
//       }

//       const validationMaxKeys = parseInt(this.configService.get('AWS_S3_VALIDATION_MAX_KEYS', '1'));
//       await this.s3Client.send(new ListObjectsV2Command({ Bucket: this.bucket, MaxKeys: validationMaxKeys }));
//       return true;
//     } catch {
//       return false;
//     }
//   }
// }
