export interface PaginationOptions {
    page?: number;
    limit?: number;
}
export interface PaginationResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export declare class PaginationUtil {
    static createPagination<T>(items: T[], options?: PaginationOptions): PaginationResult<T>;
    static getSkipAndTake(page?: number, limit?: number): {
        skip?: number;
        take?: number;
    };
}
