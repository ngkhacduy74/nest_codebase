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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const terminus_1 = require("@nestjs/terminus");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
const nestjs_prometheus_1 = require("@willsoto/nestjs-prometheus");
const prom_client_1 = require("prom-client");
let HealthController = class HealthController {
    health;
    prismaIndicator;
    memoryIndicator;
    diskIndicator;
    prisma;
    healthCheckCounter;
    constructor(health, prismaIndicator, memoryIndicator, diskIndicator, prisma, healthCheckCounter) {
        this.health = health;
        this.prismaIndicator = prismaIndicator;
        this.memoryIndicator = memoryIndicator;
        this.diskIndicator = diskIndicator;
        this.prisma = prisma;
        this.healthCheckCounter = healthCheckCounter;
    }
    check() {
        this.healthCheckCounter.inc();
        return this.health.check([
            () => this.prismaIndicator.pingCheck('database', this.prisma),
            () => this.memoryIndicator.checkHeap('memory_heap', 300 * 1024 * 1024),
            () => this.diskIndicator.checkStorage('disk', {
                path: '/',
                thresholdPercent: 0.9,
            }),
        ]);
    }
    liveness() {
        return { status: 'ok' };
    }
    readiness() {
        return this.health.check([
            () => this.prismaIndicator.pingCheck('database', this.prisma),
        ]);
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, terminus_1.HealthCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Service health check' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "check", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('live'),
    (0, swagger_1.ApiOperation)({ summary: 'Kubernetes liveness probe' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], HealthController.prototype, "liveness", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('ready'),
    (0, terminus_1.HealthCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Kubernetes readiness probe' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "readiness", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('Health'),
    (0, common_1.Controller)('health'),
    __param(5, (0, nestjs_prometheus_1.InjectMetric)('health_check_total')),
    __metadata("design:paramtypes", [terminus_1.HealthCheckService,
        terminus_1.PrismaHealthIndicator,
        terminus_1.MemoryHealthIndicator,
        terminus_1.DiskHealthIndicator,
        prisma_service_1.PrismaService,
        prom_client_1.Counter])
], HealthController);
//# sourceMappingURL=health.controller.js.map