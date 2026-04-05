export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_SERVER = 'INTERNAL_SERVER',
  BAD_REQUEST = 'BAD_REQUEST',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMIT = 'RATE_LIMIT',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  BUSINESS = 'BUSINESS',
  UNKNOWN = 'UNKNOWN',
}

export enum ErrorCode {
  // Validation Errors
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Authentication Errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Resource Errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  
  // Conflict Errors
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  
  // System Errors
  DATABASE_CONNECTION_FAILED = 'DATABASE_CONNECTION_FAILED',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TIMEOUT = 'TIMEOUT',
  
  // Business Logic Errors
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  INVALID_OPERATION = 'INVALID_OPERATION',
  RESOURCE_LOCKED = 'RESOURCE_LOCKED',
  
  // Generic Errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ErrorContext {
  requestId?: string;
  traceId?: string;
  userId?: string;
  resource?: string;
  action?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface ErrorDetail {
  field?: string;
  message?: string;
  code?: string;
  value?: any;
}

export interface ErrorMetadata {
  timestamp: string;
  requestId?: string;
  traceId?: string;
  path?: string;
  method?: string;
  statusCode: number;
  errorType: ErrorType;
  errorCode: ErrorCode;
  message?: string;
  context?: ErrorContext;
  details?: ErrorDetail[];
  stack?: string;
}
