import { ErrorMetadata } from '@/common/errors/error.types';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    type: string;
    message: string;
    details?: Array<{
      field?: string;
      message?: string;
      value?: any;
    }>;
  };
  meta: {
    timestamp: string;
    requestId?: string;
    traceId?: string;
    path?: string;
    method?: string;
    statusCode: number;
  };
}

export interface ValidationErrorResponse extends ErrorResponse {
  error: {
    code: 'VALIDATION_FAILED';
    type: 'VALIDATION';
    message: string;
    details: Array<{
      field: string;
      message: string;
      value?: any;
    }>;
  };
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message: string;
  meta: {
    timestamp: string;
    requestId?: string;
    traceId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export function createErrorResponse(error: ErrorMetadata): ErrorResponse {
  return {
    success: false,
    error: {
      code: error.errorCode,
      type: error.errorType,
      message: error.message || 'An error occurred',
      details: error.details,
    },
    meta: {
      timestamp: error.timestamp,
      requestId: error.requestId,
      traceId: error.traceId,
      path: error.path,
      method: error.method,
      statusCode: error.statusCode,
    },
  };
}

export function createValidationErrorResponse(
  error: ErrorMetadata,
  details: Array<{ field: string; message: string; value?: any }>
): ValidationErrorResponse {
  return {
    success: false,
    error: {
      code: 'VALIDATION_FAILED',
      type: 'VALIDATION',
      message: error.message || 'Validation failed',
      details,
    },
    meta: {
      timestamp: error.timestamp,
      requestId: error.requestId,
      traceId: error.traceId,
      path: error.path,
      method: error.method,
      statusCode: error.statusCode,
    },
  };
}
