import { Types } from 'mongoose';

/**
 * Tenant Context Interface
 * Represents the hierarchical tenant structure for multi-tenancy
 */
export interface TenantContext {
    countryId?: Types.ObjectId | string;
    regionId?: Types.ObjectId | string;
    businessUnitId?: Types.ObjectId | string;
    locationId?: Types.ObjectId | string;
}

/**
 * Base interface for tenant-scoped documents
 */
export interface TenantScoped {
    countryId: Types.ObjectId;
    regionId?: Types.ObjectId;
    businessUnitId?: Types.ObjectId;
    locationId?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Audit Log Interface
 */
export interface AuditLog extends TenantScoped {
    _id: Types.ObjectId;
    eventType: string;
    entityType: string;
    entityId: Types.ObjectId;
    userId: Types.ObjectId;
    changes: Record<string, any>;
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
}

/**
 * Ledger Entry Interface
 */
export interface LedgerEntry {
    _id: Types.ObjectId;
    transactionId: string;
    accountId: Types.ObjectId;
    amount: number;
    currency: string;
    type: 'debit' | 'credit';
    timestamp: Date;
    description: string;
    metadata: Record<string, any>;
    locationId: Types.ObjectId;
    businessUnitId: Types.ObjectId;
}

/**
 * Location Daily Stats Interface (Projection)
 */
export interface LocationDailyStats {
    _id: Types.ObjectId;
    locationId: Types.ObjectId;
    date: Date;
    totalBookings: number;
    totalRevenue: number;
    totalAttendance: number;
    averageOccupancy: number;
    programStats: {
        programId: Types.ObjectId;
        bookings: number;
        revenue: number;
    }[];
    lastUpdated: Date;
}

/**
 * User Activity Summary Interface (Projection)
 */
export interface UserActivitySummary {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    month: Date;
    totalBookings: number;
    totalSpent: number;
    attendanceRate: number;
    favoritePrograms: Types.ObjectId[];
    lastUpdated: Date;
}
