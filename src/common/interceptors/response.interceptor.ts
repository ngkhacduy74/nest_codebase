import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseResponse, ResponseMeta } from '@/common/interfaces/base-response.interface';

@Injectable()
export class ResponseInterceptor<T = unknown> implements NestInterceptor<T, BaseResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<BaseResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();

    return next.handle().pipe(
      map((data) => {
        // If the response already has the expected format, return as-is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Otherwise, wrap it in the standard response format
        return {
          success: true,
          data,
          message: this.extractMessage(data),
          meta: {
            timestamp: new Date().toISOString(),
            requestId: request['requestId'],
            traceId: request['traceId'],
            pagination: this.extractPagination(data),
          },
        };
      }),
    );
  }

  private extractMessage(data: unknown): string | undefined {
    // Extract message from common response patterns
    if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>;
      if (obj.message) return String(obj.message);
      if (obj.msg) return String(obj.msg);
    }
    if (typeof data === 'string') return data;
    return undefined;
  }

  private extractPagination(data: unknown): ResponseMeta['pagination'] {
    // Extract pagination info if it exists
    if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>;
      if (obj.pagination) return obj.pagination as ResponseMeta['pagination'];
      if (obj.meta && typeof obj.meta === 'object' && 'pagination' in obj.meta) {
        return (obj.meta as Record<string, unknown>).pagination as ResponseMeta['pagination'];
      }
      if (obj.page !== undefined || obj.limit !== undefined) {
        return {
          page: Number(obj.page),
          limit: Number(obj.limit),
          total: Number(obj.total),
          totalPages: Number(obj.totalPages),
        };
      }
    }
    return undefined;
  }
}
