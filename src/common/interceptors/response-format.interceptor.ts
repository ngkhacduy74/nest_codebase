import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

@Injectable()
export class ResponseFormatInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((response: unknown): ApiResponse<T> => {
        // If response already has success property, assume it's already formatted
        if (
          response &&
          typeof response === 'object' &&
          response !== null &&
          'success' in response
        ) {
          return response as ApiResponse<T>;
        }

        // Format standard success response
        return {
          success: true,
          data: response as T,
        };
      }),
    );
  }
}
