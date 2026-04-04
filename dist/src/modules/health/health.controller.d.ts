import { HealthCheckService, PrismaHealthIndicator, MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '@modules/prisma/prisma.service';
import { Counter } from 'prom-client';
export declare class HealthController {
    private readonly health;
    private readonly prismaIndicator;
    private readonly memoryIndicator;
    private readonly diskIndicator;
    private readonly prisma;
    private readonly healthCheckCounter;
    constructor(health: HealthCheckService, prismaIndicator: PrismaHealthIndicator, memoryIndicator: MemoryHealthIndicator, diskIndicator: DiskHealthIndicator, prisma: PrismaService, healthCheckCounter: Counter<string>);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult<import("@nestjs/terminus").HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>> & import("@nestjs/terminus").HealthIndicatorResult<"disk"> & import("@nestjs/terminus").HealthIndicatorResult<"memory_heap"> & import("@nestjs/terminus").HealthIndicatorResult<"database">, Partial<import("@nestjs/terminus").HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>> & import("@nestjs/terminus").HealthIndicatorResult<"disk"> & import("@nestjs/terminus").HealthIndicatorResult<"memory_heap"> & import("@nestjs/terminus").HealthIndicatorResult<"database">> | undefined, Partial<import("@nestjs/terminus").HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>> & import("@nestjs/terminus").HealthIndicatorResult<"disk"> & import("@nestjs/terminus").HealthIndicatorResult<"memory_heap"> & import("@nestjs/terminus").HealthIndicatorResult<"database">> | undefined>>;
    liveness(): {
        status: string;
    };
    readiness(): Promise<import("@nestjs/terminus").HealthCheckResult<import("@nestjs/terminus").HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>> & import("@nestjs/terminus").HealthIndicatorResult<"database">, Partial<import("@nestjs/terminus").HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>> & import("@nestjs/terminus").HealthIndicatorResult<"database">> | undefined, Partial<import("@nestjs/terminus").HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>> & import("@nestjs/terminus").HealthIndicatorResult<"database">> | undefined>>;
}
