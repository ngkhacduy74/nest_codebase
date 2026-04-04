export interface AppClsStore {
    requestId: string;
    traceId: string;
    userId?: string;
    userRole?: string;
    startTime: number;
    [key: symbol]: any;
}
export declare class AppClsModule {
}
