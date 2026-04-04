import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { BaseResponse } from '@/common/interfaces/base-response.interface';
export declare class ResponseInterceptor<T = unknown> implements NestInterceptor<T, BaseResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<BaseResponse<T>>;
    private extractMessage;
    private extractPagination;
}
