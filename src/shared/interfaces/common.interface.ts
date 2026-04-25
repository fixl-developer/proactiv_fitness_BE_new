import { Document } from 'mongoose';

// Base interfaces
export interface IBaseDocument extends Document {
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
    deletedAt?: Date;
}

export interface ITimestamps {
    createdAt: Date;
    updatedAt: Date;
}

export interface ISoftDelete {
    isDeleted: boolean;
    deletedAt?: Date;
}

export interface IAuditFields {
    createdBy?: string;
    updatedBy?: string;
    deletedBy?: string;
}

// Pagination
export interface IPaginationQuery {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    sort?: any;
    populate?: any;
    select?: string | string[];
    [key: string]: any;
}

export interface IPaginationResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

// API Response
export interface IApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: any;
    timestamp: Date;
}

// Query filters
export interface IQueryFilter {
    [key: string]: any;
}

// Address
export interface IAddress {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

// Contact Information
export interface IContactInfo {
    email?: string;
    phone?: string;
    alternatePhone?: string;
    emergencyContact?: {
        name: string;
        relationship: string;
        phone: string;
    };
}

// File Upload
export interface IFileUpload {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    path: string;
    url?: string;
}

// Multi-tenancy
export interface ITenantContext {
    tenantId: string;
    organizationId?: string;
    locationId?: string;
}

// Search
export interface ISearchQuery {
    query: string;
    fields?: string[];
    filters?: IQueryFilter;
}

// Bulk Operation
export interface IBulkOperationResult {
    success: number;
    failed: number;
    errors: Array<{
        index: number;
        error: string;
    }>;
}

// Time Range
export interface ITimeRange {
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
}

export interface IDateRange {
    startDate: Date;
    endDate: Date;
}

// Metadata
export interface IMetadata {
    [key: string]: any;
}

// Error Details
export interface IErrorDetails {
    code: string;
    message: string;
    field?: string;
    details?: any;
}
