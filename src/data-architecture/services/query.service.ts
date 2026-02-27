import { Db, Collection, Filter, FindOptions } from 'mongodb';
import { TenantContext } from '../interfaces';
import { COLLECTION_METADATA } from '../constants';
import logger from '../../shared/utils/logger.util';

export interface QueryFilter {
    tenantId?: string;
    startDate?: Date;
    endDate?: Date;
    actorId?: string;
    actionType?: string;
    resourceType?: string;
    searchText?: string;
    page?: number;
    pageSize?: number;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

/**
 * Query Service with tenant isolation and performance optimization
 */
export class QueryService {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    /**
     * Apply tenant filter to query based on tenant context
     */
    private applyTenantFilter(query: any, context: TenantContext): any {
        const tenantFilter: any = {};

        if (context.locationId) {
            tenantFilter.locationId = context.locationId;
        } else if (context.businessUnitId) {
            tenantFilter.businessUnitId = context.businessUnitId;
        } else if (context.regionId) {
            tenantFilter.regionId = context.regionId;
        } else if (context.countryId) {
            tenantFilter.countryId = context.countryId;
        }

        return { ...query, ...tenantFilter };
    }

    /**
     * Execute a paginated query with tenant isolation
     */
    async queryWithPagination<T>(
        collectionName: string,
        filter: QueryFilter,
        tenantContext: TenantContext,
        options: FindOptions = {}
    ): Promise<PaginatedResult<T>> {
        const collection = this.db.collection<T>(collectionName);

        // Build MongoDB filter
        let mongoFilter: Filter<T> = {};

        // Apply tenant isolation
        const metadata = COLLECTION_METADATA[collectionName];
        if (metadata?.tenantScoped) {
            mongoFilter = this.applyTenantFilter(mongoFilter, tenantContext) as Filter<T>;
        }

        // Apply date range filter
        if (filter.startDate || filter.endDate) {
            const dateFilter: any = {};
            if (filter.startDate) dateFilter.$gte = filter.startDate;
            if (filter.endDate) dateFilter.$lte = filter.endDate;
            (mongoFilter as any).timestamp = dateFilter;
        }

        // Apply other filters
        if (filter.actorId) {
            (mongoFilter as any).userId = filter.actorId;
        }
        if (filter.actionType) {
            (mongoFilter as any).eventType = filter.actionType;
        }
        if (filter.resourceType) {
            (mongoFilter as any).entityType = filter.resourceType;
        }

        // Apply text search if supported
        if (filter.searchText) {
            (mongoFilter as any).$text = { $search: filter.searchText };
        }

        // Pagination
        const page = filter.page || 1;
        const pageSize = Math.min(filter.pageSize || 50, 1000); // Max 1000 per page
        const skip = (page - 1) * pageSize;

        // Execute query
        const [data, total] = await Promise.all([
            collection
                .find(mongoFilter, options)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(pageSize)
                .toArray(),
            collection.countDocuments(mongoFilter),
        ]);

        const totalPages = Math.ceil(total / pageSize);

        logger.debug('Query executed', {
            collection: collectionName,
            filter: mongoFilter,
            page,
            pageSize,
            total,
            resultCount: data.length,
        });

        return {
            data,
            total,
            page,
            pageSize,
            totalPages,
        };
    }

    /**
     * Find documents by resource (entity)
     */
    async findByResource<T>(
        collectionName: string,
        resourceType: string,
        resourceId: string,
        tenantContext: TenantContext
    ): Promise<T[]> {
        const collection = this.db.collection<T>(collectionName);

        let filter: any = {
            entityType: resourceType,
            entityId: resourceId,
        };

        // Apply tenant isolation
        const metadata = COLLECTION_METADATA[collectionName];
        if (metadata?.tenantScoped) {
            filter = this.applyTenantFilter(filter, tenantContext);
        }

        return collection.find(filter).sort({ timestamp: -1 }).toArray();
    }

    /**
     * Get consent history for a user
     */
    async getConsentHistory(
        userId: string,
        tenantContext: TenantContext
    ): Promise<any[]> {
        return this.findByResource(
            'audit_logs',
            'user',
            userId,
            tenantContext
        ).then(logs =>
            logs.filter((log: any) => log.eventType.startsWith('consent.'))
        );
    }

    /**
     * Get custody history for a minor
     */
    async getCustodyHistory(
        minorId: string,
        tenantContext: TenantContext
    ): Promise<any[]> {
        return this.findByResource(
            'audit_logs',
            'user',
            minorId,
            tenantContext
        ).then(logs =>
            logs.filter((log: any) => log.eventType.startsWith('custody.'))
        );
    }

    /**
     * Get certification history for a trainer
     */
    async getCertificationHistory(
        trainerId: string,
        tenantContext: TenantContext
    ): Promise<any[]> {
        return this.findByResource(
            'audit_logs',
            'user',
            trainerId,
            tenantContext
        ).then(logs =>
            logs.filter((log: any) => log.eventType.startsWith('certification.'))
        );
    }

    /**
     * Get automation rule history
     */
    async getAutomationRuleHistory(
        ruleId: string,
        tenantContext: TenantContext
    ): Promise<any[]> {
        return this.findByResource(
            'audit_logs',
            'automation_rule',
            ruleId,
            tenantContext
        );
    }

    /**
     * Get impersonation session history
     */
    async getImpersonationHistory(
        adminId: string,
        tenantContext: TenantContext,
        startDate?: Date,
        endDate?: Date
    ): Promise<any[]> {
        const collection = this.db.collection('audit_logs');

        let filter: any = {
            userId: adminId,
            eventType: { $in: ['impersonation.started', 'impersonation.action', 'impersonation.ended'] },
        };

        // Apply tenant isolation
        filter = this.applyTenantFilter(filter, tenantContext);

        // Apply date range
        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) filter.timestamp.$gte = startDate;
            if (endDate) filter.timestamp.$lte = endDate;
        }

        return collection.find(filter).sort({ timestamp: -1 }).toArray();
    }

    /**
     * Execute complex query with AND/OR logic
     */
    async complexQuery<T>(
        collectionName: string,
        conditions: any[],
        operator: '$and' | '$or',
        tenantContext: TenantContext,
        options: FindOptions = {}
    ): Promise<T[]> {
        const collection = this.db.collection<T>(collectionName);

        let filter: any = {
            [operator]: conditions,
        };

        // Apply tenant isolation
        const metadata = COLLECTION_METADATA[collectionName];
        if (metadata?.tenantScoped) {
            filter = this.applyTenantFilter(filter, tenantContext);
        }

        return collection.find(filter, options).toArray();
    }

    /**
     * Full-text search on context data
     */
    async fullTextSearch<T>(
        collectionName: string,
        searchText: string,
        tenantContext: TenantContext,
        page: number = 1,
        pageSize: number = 50
    ): Promise<PaginatedResult<T>> {
        const collection = this.db.collection<T>(collectionName);

        let filter: any = {
            $text: { $search: searchText },
        };

        // Apply tenant isolation
        const metadata = COLLECTION_METADATA[collectionName];
        if (metadata?.tenantScoped) {
            filter = this.applyTenantFilter(filter, tenantContext);
        }

        const skip = (page - 1) * pageSize;

        const [data, total] = await Promise.all([
            collection
                .find(filter, { score: { $meta: 'textScore' } })
                .sort({ score: { $meta: 'textScore' } })
                .skip(skip)
                .limit(pageSize)
                .toArray(),
            collection.countDocuments(filter),
        ]);

        return {
            data,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }

    /**
     * Cross-tenant query (admin only)
     */
    async crossTenantQuery<T>(
        collectionName: string,
        filter: any,
        options: FindOptions = {}
    ): Promise<T[]> {
        const collection = this.db.collection<T>(collectionName);

        logger.warn('Cross-tenant query executed', {
            collection: collectionName,
            filter,
        });

        return collection.find(filter, options).toArray();
    }
}