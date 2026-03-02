import { Document } from 'mongoose';

// Log Entry Interface
export interface ILogEntry extends Document {
    logId: string;
    level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    message: string;
    service: string;
    module: string;
    context: Record<string, any>;
    userId?: string;
    requestId?: string;
    traceId?: string;
    spanId?: string;
    timestamp: Date;
}

// Trace Interface
export interface ITrace extends Document {
    traceId: string;
    serviceName: string;
    operationName: string;
    spans: {
        spanId: string;
        parentSpanId?: string;
        operationName: string;
        startTime: Date;
        endTime: Date;
        duration: number;
        tags: Record<string, any>;
        logs: any[];
    }[];
    duration: number;
    status: 'success' | 'error';
    timestamp: Date;
}

// Performance Metric Interface
export interface IPerformanceMetric extends Document {
    metricId: string;
    metricType: 'response_time' | 'throughput' | 'error_rate' | 'cpu_usage' | 'memory_usage' | 'db_query_time';
    service: string;
    endpoint?: string;
    value: number;
    unit: string;
    tags: Record<string, any>;
    timestamp: Date;
}

// Rate Limit Interface
export interface IRateLimit extends Document {
    rateLimitId: string;
    identifier: string;
    identifierType: 'ip' | 'user' | 'api_key';
    endpoint: string;
    requestCount: number;
    windowStart: Date;
    windowEnd: Date;
    limit: number;
    isBlocked: boolean;
}

// Alert Interface
export interface IAlert extends Document {
    alertId: string;
    alertType: 'performance' | 'error' | 'security' | 'availability' | 'custom';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    source: string;
    metadata: Record<string, any>;
    status: 'open' | 'acknowledged' | 'resolved' | 'closed';
    acknowledgedBy?: string;
    acknowledgedAt?: Date;
    resolvedBy?: string;
    resolvedAt?: Date;
    createdAt: Date;
}

// Security Event Interface
export interface ISecurityEvent extends Document {
    eventId: string;
    eventType: 'login_attempt' | 'failed_login' | 'unauthorized_access' | 'suspicious_activity' | 'data_breach_attempt';
    severity: 'low' | 'medium' | 'high' | 'critical';
    userId?: string;
    ipAddress: string;
    userAgent: string;
    details: Record<string, any>;
    actionTaken?: string;
    timestamp: Date;
}

// Uptime Monitor Interface
export interface IUptimeMonitor extends Document {
    monitorId: string;
    serviceName: string;
    endpoint: string;
    status: 'up' | 'down' | 'degraded';
    lastChecked: Date;
    responseTime?: number;
    uptime: {
        percentage: number;
        totalChecks: number;
        successfulChecks: number;
        failedChecks: number;
    };
}

// Request Interfaces
export interface ICreateLogRequest {
    level: string;
    message: string;
    service: string;
    module: string;
    context?: Record<string, any>;
    userId?: string;
    requestId?: string;
}

export interface ICreateTraceRequest {
    serviceName: string;
    operationName: string;
    spans: any[];
}

export interface ICreateMetricRequest {
    metricType: string;
    service: string;
    endpoint?: string;
    value: number;
    unit: string;
    tags?: Record<string, any>;
}

export interface ICheckRateLimitRequest {
    identifier: string;
    identifierType: string;
    endpoint: string;
}

export interface ICreateAlertRequest {
    alertType: string;
    severity: string;
    title: string;
    description: string;
    source: string;
    metadata?: Record<string, any>;
}

export interface ILogSecurityEventRequest {
    eventType: string;
    severity: string;
    userId?: string;
    ipAddress: string;
    userAgent: string;
    details: Record<string, any>;
}
