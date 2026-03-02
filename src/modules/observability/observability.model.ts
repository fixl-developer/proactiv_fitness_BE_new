import mongoose, { Schema } from 'mongoose';
import { ILogEntry, ITrace, IPerformanceMetric, IRateLimit, IAlert, ISecurityEvent, IUptimeMonitor } from './observability.interface';

const LogEntrySchema = new Schema<ILogEntry>({
    logId: { type: String, required: true, unique: true, index: true },
    level: { type: String, required: true, enum: ['debug', 'info', 'warn', 'error', 'fatal'], index: true },
    message: { type: String, required: true },
    service: { type: String, required: true, index: true },
    module: { type: String, required: true },
    context: { type: Schema.Types.Mixed },
    userId: { type: String, index: true },
    requestId: { type: String, index: true },
    traceId: { type: String, index: true },
    spanId: { type: String },
    timestamp: { type: Date, default: Date.now, index: true }
});

const TraceSchema = new Schema<ITrace>({
    traceId: { type: String, required: true, unique: true, index: true },
    serviceName: { type: String, required: true, index: true },
    operationName: { type: String, required: true },
    spans: [{
        spanId: { type: String, required: true },
        parentSpanId: { type: String },
        operationName: { type: String, required: true },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        duration: { type: Number, required: true },
        tags: { type: Schema.Types.Mixed },
        logs: [{ type: Schema.Types.Mixed }]
    }],
    duration: { type: Number, required: true },
    status: { type: String, enum: ['success', 'error'], required: true },
    timestamp: { type: Date, default: Date.now, index: true }
});

const PerformanceMetricSchema = new Schema<IPerformanceMetric>({
    metricId: { type: String, required: true, unique: true, index: true },
    metricType: {
        type: String,
        required: true,
        enum: ['response_time', 'throughput', 'error_rate', 'cpu_usage', 'memory_usage', 'db_query_time'],
        index: true
    },
    service: { type: String, required: true, index: true },
    endpoint: { type: String },
    value: { type: Number, required: true },
    unit: { type: String, required: true },
    tags: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, index: true }
});

const RateLimitSchema = new Schema<IRateLimit>({
    rateLimitId: { type: String, required: true, unique: true, index: true },
    identifier: { type: String, required: true, index: true },
    identifierType: { type: String, required: true, enum: ['ip', 'user', 'api_key'] },
    endpoint: { type: String, required: true, index: true },
    requestCount: { type: Number, required: true, default: 0 },
    windowStart: { type: Date, required: true },
    windowEnd: { type: Date, required: true },
    limit: { type: Number, required: true },
    isBlocked: { type: Boolean, default: false }
});

const AlertSchema = new Schema<IAlert>({
    alertId: { type: String, required: true, unique: true, index: true },
    alertType: {
        type: String,
        required: true,
        enum: ['performance', 'error', 'security', 'availability', 'custom'],
        index: true
    },
    severity: { type: String, required: true, enum: ['low', 'medium', 'high', 'critical'], index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    source: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    status: { type: String, enum: ['open', 'acknowledged', 'resolved', 'closed'], default: 'open', index: true },
    acknowledgedBy: { type: String },
    acknowledgedAt: { type: Date },
    resolvedBy: { type: String },
    resolvedAt: { type: Date },
    createdAt: { type: Date, default: Date.now, index: true }
});

const SecurityEventSchema = new Schema<ISecurityEvent>({
    eventId: { type: String, required: true, unique: true, index: true },
    eventType: {
        type: String,
        required: true,
        enum: ['login_attempt', 'failed_login', 'unauthorized_access', 'suspicious_activity', 'data_breach_attempt'],
        index: true
    },
    severity: { type: String, required: true, enum: ['low', 'medium', 'high', 'critical'], index: true },
    userId: { type: String, index: true },
    ipAddress: { type: String, required: true, index: true },
    userAgent: { type: String, required: true },
    details: { type: Schema.Types.Mixed, required: true },
    actionTaken: { type: String },
    timestamp: { type: Date, default: Date.now, index: true }
});

const UptimeMonitorSchema = new Schema<IUptimeMonitor>({
    monitorId: { type: String, required: true, unique: true, index: true },
    serviceName: { type: String, required: true, index: true },
    endpoint: { type: String, required: true },
    status: { type: String, enum: ['up', 'down', 'degraded'], default: 'up' },
    lastChecked: { type: Date, default: Date.now },
    responseTime: { type: Number },
    uptime: {
        percentage: { type: Number, default: 100 },
        totalChecks: { type: Number, default: 0 },
        successfulChecks: { type: Number, default: 0 },
        failedChecks: { type: Number, default: 0 }
    }
});

export const LogEntry = mongoose.model<ILogEntry>('LogEntry', LogEntrySchema);
export const Trace = mongoose.model<ITrace>('Trace', TraceSchema);
export const PerformanceMetric = mongoose.model<IPerformanceMetric>('PerformanceMetric', PerformanceMetricSchema);
export const RateLimit = mongoose.model<IRateLimit>('RateLimit', RateLimitSchema);
export const Alert = mongoose.model<IAlert>('Alert', AlertSchema);
export const SecurityEvent = mongoose.model<ISecurityEvent>('SecurityEvent', SecurityEventSchema);
export const UptimeMonitor = mongoose.model<IUptimeMonitor>('UptimeMonitor', UptimeMonitorSchema);
