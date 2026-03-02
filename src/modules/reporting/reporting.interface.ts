import { Document } from 'mongoose';

// Report Interface
export interface IReport extends Document {
    reportId: string;
    reportType: 'financial' | 'operations' | 'attendance' | 'performance' | 'custom';
    reportName: string;
    description?: string;
    config: {
        dataSource: string[];
        filters: Record<string, any>;
        groupBy?: string[];
        aggregations?: Record<string, string>;
        dateRange: {
            from: Date;
            to: Date;
        };
    };
    schedule?: {
        isScheduled: boolean;
        frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
        nextRun?: Date;
        lastRun?: Date;
        recipients?: string[];
    };
    format: 'pdf' | 'excel' | 'csv' | 'json';
    status: 'draft' | 'active' | 'archived';
    businessUnitId: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Report Execution Interface
export interface IReportExecution extends Document {
    executionId: string;
    reportId: string;
    reportName: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: {
        percentage: number;
        currentStep: string;
    };
    result?: {
        fileUrl: string;
        fileSize: number;
        recordCount: number;
        generatedAt: Date;
    };
    error?: string;
    executedBy: string;
    executedAt: Date;
}

// Dashboard Interface
export interface IDashboard extends Document {
    dashboardId: string;
    dashboardName: string;
    description?: string;
    widgets: {
        widgetId: string;
        widgetType: 'chart' | 'table' | 'metric' | 'gauge';
        title: string;
        dataSource: string;
        config: Record<string, any>;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    }[];
    isDefault: boolean;
    isPublic: boolean;
    businessUnitId: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Data Warehouse Projection Interface
export interface IProjection extends Document {
    projectionId: string;
    projectionName: string;
    sourceCollection: string;
    targetCollection: string;
    transformations: {
        field: string;
        operation: string;
        params?: Record<string, any>;
    }[];
    schedule: {
        frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
        lastRun?: Date;
        nextRun?: Date;
    };
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

// Request Interfaces
export interface ICreateReportRequest {
    reportType: string;
    reportName: string;
    description?: string;
    config: {
        dataSource: string[];
        filters: Record<string, any>;
        groupBy?: string[];
        aggregations?: Record<string, string>;
        dateRange: {
            from: Date;
            to: Date;
        };
    };
    format: string;
}

export interface IExecuteReportRequest {
    reportId: string;
}

export interface IScheduleReportRequest {
    reportId: string;
    frequency: string;
    recipients: string[];
}

export interface ICreateDashboardRequest {
    dashboardName: string;
    description?: string;
    widgets: any[];
    isPublic?: boolean;
}

export interface ICreateProjectionRequest {
    projectionName: string;
    sourceCollection: string;
    targetCollection: string;
    transformations: any[];
    frequency: string;
}
