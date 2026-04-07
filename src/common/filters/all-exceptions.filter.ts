import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ClsService } from 'nestjs-cls';

import { AppClsStore } from '@/modules/cls/cls.module';
import { ApplicationError } from '../domain/errors/application.error';
import { ValidationError } from '../domain/errors/validation.error';
import { DomainError } from '../domain/errors/domain.error';
import { InfrastructureError } from '../domain/errors/infrastructure.error';

interface ErrorResponse {
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

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly cls: ClsService<AppClsStore>) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, code, message, errors, layer } =
      this.classify(exception);
    const isProd = process.env['NODE_ENV'] === 'production';

    const body: ErrorResponse = {
      success: false,
      statusCode,
      code,
      message,
      errors,
      requestId: this.cls.get('requestId'),
      traceId: this.cls.get('traceId'),
      timestamp: new Date().toISOString(),
      path: request.url,
      layer,
      ...(!isProd && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    };

    this.logger.error(
      `[${statusCode}] ${code} — ${request.method} ${request.url} — ${message}${layer ? ` — Layer: ${layer}` : ''}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    reply.status(statusCode).json(body);
  }

  private classify(exception: unknown): {
    statusCode: number;
    code: string;
    message: string;
    errors?: string[];
    layer?: string;
  } {
    // 1. NestJS HTTP exceptions (most common) - Controller layer
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        return {
          statusCode: status,
          code: 'HTTP_ERROR',
          message: response,
          layer: 'Controller',
        };
      }

      if (typeof response === 'object' && response !== null) {
        const r = response as Record<string, unknown>;
        return {
          statusCode: status,
          code: (r['error'] as string | undefined) ?? 'HTTP_ERROR',
          message:
            typeof r['message'] === 'string' ? r['message'] : 'Request error',
          errors: Array.isArray(r['message'])
            ? (r['message'] as string[])
            : undefined,
          layer: 'Controller',
        };
      }
    }

    // 2. Application errors (use-case failures) — Application layer
    if (exception instanceof ApplicationError) {
      const appError = exception;
      return {
        statusCode: appError.statusCode,
        code: appError.code,
        message: appError.message,
        layer: 'Application',
      };
    }

    // 3. Validation errors — DTO/Value Object validation → 400 Bad Request
    if (exception instanceof ValidationError) {
      const validationError = exception;
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        code: validationError.code,
        message: validationError.message,
        layer: 'Validation',
      };
    }

    // 4. Domain errors — business rule violations → Domain layer
    if (exception instanceof DomainError) {
      const domainError = exception;
      return {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        code: domainError.code,
        message: domainError.message,
        layer: 'Domain',
      };
    }

    // 5. Infrastructure errors — Infrastructure layer
    if (exception instanceof InfrastructureError) {
      return {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        code: 'SERVICE_UNAVAILABLE',
        message: 'A backend service is temporarily unavailable',
        layer: 'Infrastructure',
      };
    }

    // 6. Unknown errors — 500
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      layer: 'Unknown',
    };
  }
}
