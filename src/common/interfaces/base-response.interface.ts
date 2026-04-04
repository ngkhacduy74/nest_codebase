export interface PaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface ResponseMeta {
  timestamp: string;
  requestId?: string;
  traceId?: string;
  pagination?: PaginationMeta;
}

export interface BaseResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: ResponseMeta;
}

export interface ErrorResponse {
  success: false;
  statusCode: number;
  code: string;
  message: string;
  errors?: string[];
  requestId?: string;
  traceId?: string;
  timestamp: string;
  path: string;
  layer?: string;
  stack?: string;
}

export type ApiResponse<T> = BaseResponse<T> | ErrorResponse;
