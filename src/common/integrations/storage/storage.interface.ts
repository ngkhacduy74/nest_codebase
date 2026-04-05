import { Readable } from 'stream';

export interface StorageUploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  isPublic?: boolean;
  expiresAt?: Date;
}

export interface StorageUploadResult {
  success: boolean;
  key?: string;
  url?: string;
  etag?: string;
  size?: number;
  providerResponse?: Record<string, unknown>;
  error?: string;
}

export interface StorageDownloadResult {
  success: boolean;
  buffer?: Buffer;
  stream?: Readable;
  contentType?: string;
  size?: number;
  providerResponse?: Record<string, unknown>;
  error?: string;
}

export interface StorageDeleteResult {
  success: boolean;
  providerResponse?: Record<string, unknown>;
  error?: string;
}

export interface StorageListResult {
  success: boolean;
  files?: Array<{
    key: string;
    size: number;
    lastModified: Date;
    contentType?: string;
    etag?: string;
  }>;
  providerResponse?: Record<string, unknown>;
  error?: string;
}

export interface StorageProvider {
  /**
   * Upload a file to storage
   */
  upload(key: string, buffer: Buffer | Readable, options?: StorageUploadOptions): Promise<StorageUploadResult>;

  /**
   * Download a file from storage
   */
  download(key: string): Promise<StorageDownloadResult>;

  /**
   * Delete a file from storage
   */
  delete(key: string): Promise<StorageDeleteResult>;

  /**
   * List files in storage (with optional prefix)
   */
  list(prefix?: string, maxKeys?: number): Promise<StorageListResult>;

  /**
   * Get a signed URL for temporary access
   */
  getSignedUrl(key: string, expiresIn: number): Promise<string>;

  /**
   * Check if file exists
   */
  exists(key: string): Promise<boolean>;

  /**
   * Get file metadata
   */
  getMetadata(key: string): Promise<{
    size: number;
    contentType?: string;
    lastModified: Date;
    etag?: string;
  } | null>;

  /**
   * Get provider name for logging/monitoring
   */
  getProviderName(): string;

  /**
   * Validate provider configuration
   */
  validateConfig(): Promise<boolean>;
}

export interface StorageConfig {
  provider: 'aws-s3' | 'cloudinary' | 'google-cloud';
  awsS3?: {
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
    forcePathStyle?: boolean;
  };
  cloudinary?: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    folder?: string;
  };
  googleCloud?: {
    projectId: string;
    keyFilename: string;
    bucket: string;
  };
}

export const STORAGE_CONFIG_KEY = 'storage';
