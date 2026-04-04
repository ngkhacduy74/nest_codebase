"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let ResponseInterceptor = class ResponseInterceptor {
    intercept(context, next) {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        return next.handle().pipe((0, operators_1.map)((data) => {
            if (data && typeof data === 'object' && 'success' in data) {
                return data;
            }
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
        }));
    }
    extractMessage(data) {
        if (data && typeof data === 'object') {
            const obj = data;
            if (obj.message)
                return String(obj.message);
            if (obj.msg)
                return String(obj.msg);
        }
        if (typeof data === 'string')
            return data;
        return undefined;
    }
    extractPagination(data) {
        if (data && typeof data === 'object') {
            const obj = data;
            if (obj.pagination)
                return obj.pagination;
            if (obj.meta && typeof obj.meta === 'object' && 'pagination' in obj.meta) {
                return obj.meta.pagination;
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
};
exports.ResponseInterceptor = ResponseInterceptor;
exports.ResponseInterceptor = ResponseInterceptor = __decorate([
    (0, common_1.Injectable)()
], ResponseInterceptor);
//# sourceMappingURL=response.interceptor.js.map