"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationUtil = void 0;
class PaginationUtil {
    static createPagination(items, options = {}) {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const total = items.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedItems = items.slice(startIndex, endIndex);
        return {
            data: paginatedItems,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        };
    }
    static getSkipAndTake(page, limit) {
        const parsedPage = page || 1;
        const parsedLimit = limit || 10;
        return {
            skip: (parsedPage - 1) * parsedLimit,
            take: parsedLimit,
        };
    }
}
exports.PaginationUtil = PaginationUtil;
//# sourceMappingURL=pagination.util.js.map