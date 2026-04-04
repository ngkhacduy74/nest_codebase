"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const nestjs_cls_1 = require("nestjs-cls");
const domain_error_1 = require("../../shared/domain/errors/domain.error");
const application_error_1 = require("../../shared/domain/errors/application.error");
const infrastructure_error_1 = require("../../shared/domain/errors/infrastructure.error");
const validation_error_1 = require("../../shared/domain/errors/validation.error");
const config_1 = require("../../config");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    cls;
    logger = new common_1.Logger(AllExceptionsFilter_1.name);
    constructor(cls) {
        this.cls = cls;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const reply = ctx.getResponse();
        const request = ctx.getRequest();
        const { statusCode, code, message, errors, layer } = this.classify(exception);
        const isProd = process.env['NODE_ENV'] === config_1.NodeEnv.Production;
        const body = {
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
        this.logger.error(`[${statusCode}] ${code} — ${request.method} ${request.url} — ${message}${layer ? ` — Layer: ${layer}` : ''}`, exception instanceof Error ? exception.stack : undefined);
        void reply.status(statusCode).send(body);
    }
    classify(exception) {
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const response = exception.getResponse();
            if (typeof response === 'string') {
                return { statusCode: status, code: 'HTTP_ERROR', message: response, layer: 'Controller' };
            }
            if (typeof response === 'object' && response !== null) {
                const r = response;
                return {
                    statusCode: status,
                    code: r['error'] ?? 'HTTP_ERROR',
                    message: typeof r['message'] === 'string' ? r['message'] : 'Request error',
                    errors: Array.isArray(r['message'])
                        ? r['message']
                        : undefined,
                    layer: 'Controller',
                };
            }
        }
        if (exception instanceof application_error_1.ApplicationError) {
            return {
                statusCode: exception.statusCode,
                code: exception.code,
                message: exception.message,
                layer: 'Application',
            };
        }
        if (exception instanceof validation_error_1.ValidationError) {
            return {
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                code: exception.code,
                message: exception.message,
                layer: 'Validation',
            };
        }
        if (exception instanceof domain_error_1.DomainError) {
            return {
                statusCode: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                code: exception.code,
                message: exception.message,
                layer: 'Domain',
            };
        }
        if (exception instanceof infrastructure_error_1.InfrastructureError) {
            return {
                statusCode: common_1.HttpStatus.SERVICE_UNAVAILABLE,
                code: 'SERVICE_UNAVAILABLE',
                message: 'A backend service is temporarily unavailable',
                layer: 'Infrastructure',
            };
        }
        return {
            statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
            layer: 'Unknown',
        };
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [nestjs_cls_1.ClsService])
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map