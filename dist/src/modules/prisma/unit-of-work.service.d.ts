import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from './prisma.service';
export type PrismaTransactionClient = Prisma.TransactionClient;
export type TransactionCallback<T> = (tx: PrismaTransactionClient) => Promise<T>;
export declare class UnitOfWork {
    private readonly prisma;
    constructor(prisma: PrismaService);
    run<T>(callback: TransactionCallback<T>, options?: {
        maxWait?: number;
        timeout?: number;
    }): Promise<T>;
    private isPrismaKnownError;
}
