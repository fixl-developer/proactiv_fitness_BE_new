import { IPaginationQuery, IPaginationResult } from '@shared/interfaces/common.interface';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '@shared/constants';

export class PaginationUtil {
    static getPaginationParams(query: IPaginationQuery) {
        const page = Math.max(1, Number(query.page) || DEFAULT_PAGE);
        const limit = Math.min(Number(query.limit) || DEFAULT_LIMIT, MAX_LIMIT);
        const skip = (page - 1) * limit;

        return { page, limit, skip };
    }

    static buildPaginationResult<T>(
        data: T[],
        total: number,
        page: number,
        limit: number
    ): IPaginationResult<T> {
        const totalPages = Math.ceil(total / limit);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    }

    static getSortOptions(sortBy?: string, sortOrder?: 'asc' | 'desc') {
        if (!sortBy) return { createdAt: -1 };

        return {
            [sortBy]: sortOrder === 'asc' ? 1 : -1,
        };
    }
}
