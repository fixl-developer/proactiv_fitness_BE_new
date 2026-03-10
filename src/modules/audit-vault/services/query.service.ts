import { Db } from 'mongodb';
import { AuditLog } from '../interfaces';
import logger from '../../../shared/utils/logger.util';

export interface AuditLogFilter {
    tenantId: string;
    startDate?: Date;
    endDate?: Date;
    actorId?: string;
    actionType?: string;
    actionCategory?: string;
    resourceType?: string;
    resourceId?: string;
    searchText?: string;
    page?: number;
    pageSize?: number;
}

export interface PaginatedAuditResult<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

/**
 * Audit Query Service with tenant isolation
 */
export class AuditQueryService {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    /**
     * Query audit logs with filters and pagination
     */
    async queryLogs(filter: AuditLogFilter): Promise<PaginatedAuditResult<AuditLog>> {
        const collection = this.db.collection<AuditLog>('audit_logs');

        // Build MongoDB filter
        const mongoFilter: any = { tenantId: filter.tenantId };

        // Date range filter
        if (filter.startDate || filter.endDate) {
            mongoFilter.timestamp = {};
            if (filter.startDate) mongoFilter.timestamp.$gte = filter.startDate;
            if (filter.endDate) mongoFilter.timestamp.$lte = filter.endDate;
        }

        // Other filters
        if (filter.actorId) mongoFilter.actorId = filter.actorId;
        if (filter.actionType) mongoFilter.actionType = filter.actionType;
        if (filter.actionCategory) mongoFilter.actionCategory = filter.actionCategory;
        if (filter.resourceType) mongoFilter.resourceType = filter.resourceType;
        if (filter.resourceId) mongoFilter.resourceId = filter.resourceId;

        // Text search
        if (filter.searchText) {
            mongoFilter.$text = { $search: filter.searchText };
        }

        // Pagination
        const page = filter.page || 1;
        const pageSize = Math.min(filter.pageSize || 50, 1000);
        const skip = (page - 1) * pageSize;

        // Execute query
        const [data, total] = await Promise.all([
            collection
                .find(mongoFilter)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(pageSize)
                .toArray(),
            collection.countDocuments(mongoFilter),
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
     * Get audit log by ID
     */
    async getLogById(logId: string, tenantId: string): Promise<AuditLog | null> {
        const collection = this.db.collection<AuditLog>('audit_logs');
        return collection.findOne({ logId, tenantId });
    }

    /**
     * Get logs by resource
     */
    async getLogsByResource(
        resourceType: string,
        resourceId: string,
        tenantId: string
    ): Promise<AuditLog[]> {
        const collection = this.db.collection<AuditLog>('audit_logs');
        return collection
            .find({ resourceType, resourceId, tenantId })
            .sort({ timestamp: -1 })
            .toArray();
    }

    /**
     * Get consent history for a user
     */
    async getConsentHistory(userId: string, tenantId: string): Promise<AuditLog[]> {
        const collection = this.db.collection<AuditLog>('audit_logs');
        return collection
            .find({
                tenantId,
                resourceId: userId,
                actionType: { $regex: '^consent\\.' },
            })
            .sort({ timestamp: -1 })
            .toArray();
    }

    /**
     * Get custody history for a minor
     */
    async getCustodyHistory(minorId: string, tenantId: string): Promise<AuditLog[]> {
        const collection = this.db.collection<AuditLog>('audit_logs');
        return collection
            .find({
                tenantId,
                resourceId: minorId,
                actionType: { $regex: '^custody\\.' },
            })
            .sort({ timestamp: -1 })
            .toArray();
    }

    /**
     * Get financial transaction history
     */
    async getFinancialHistory(
        tenantId: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<AuditLog[]> {
        const collection = this.db.collection<AuditLog>('audit_logs');

        const filter: any = {
            tenantId,
            actionCategory: 'financial',
        };

        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) filter.timestamp.$gte = startDate;
            if (endDate) filter.timestamp.$lte = endDate;
        }

        return collection.find(filter).sort({ timestamp: -1 }).toArray();
    }

    /**
     * Get certification history for a trainer
     */
    async getCertificationHistory(trainerId: string, tenantId: string): Promise<AuditLog[]> {
        const collection = this.db.collection<AuditLog>('audit_logs');
        return collection
            .find({
                tenantId,
                resourceId: trainerId,
                actionType: { $regex: '^certification\\.' },
            })
            .sort({ timestamp: -1 })
            .toArray();
    }

    /**
     * Get automation rule history
     */
    async getAutomationHistory(ruleId: string, tenantId: string): Promise<AuditLog[]> {
        const collection = this.db.collection<AuditLog>('audit_logs');
        return collection
            .find({
                tenantId,
                resourceId: ruleId,
                actionCategory: 'automation',
            })
            .sort({ timestamp: -1 })
            .toArray();
    }

    /**
     * Get impersonation session history
     */
    async getImpersonationHistory(
        adminId: string,
        tenantId: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<AuditLog[]> {
        const collection = this.db.collection<AuditLog>('audit_logs');

        const filter: any = {
            tenantId,
            actorId: adminId,
            actionType: { $regex: '^impersonation\\.' },
        };

        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) filter.timestamp.$gte = startDate;
            if (endDate) filter.timestamp.$lte = endDate;
        }

        return collection.find(filter).sort({ timestamp: -1 }).toArray();
    }

    /**
     * Cross-tenant query (admin only)
     */
    async crossTenantQuery(filter: any): Promise<AuditLog[]> {
        const collection = this.db.collection<AuditLog>('audit_logs');

        logger.warn('Cross-tenant audit query executed', { filter });

        return collection.find(filter).sort({ timestamp: -1 }).toArray();
    }

    /**
     * Full-text search
     */
    async fullTextSearch(
        searchText: string,
        tenantId: string,
        page: number = 1,
        pageSize: number = 50
    ): Promise<PaginatedAuditResult<AuditLog>> {
        const collection = this.db.collection<AuditLog>('audit_logs');

        const filter = {
            tenantId,
            $text: { $search: searchText },
        };

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
}