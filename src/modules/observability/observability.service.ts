import { LogEntry, Trace, PerformanceMetric, RateLimit, Alert, SecurityEvent, UptimeMonitor } from './observability.model';
import { ICreateLogRequest, ICreateTraceRequest, ICreateMetricRequest, ICheckRateLimitRequest, ICreateAlertRequest, ILogSecurityEventRequest } from './observability.interface';
import { AppError } from '../../shared/utils/app-error.util';
import { v4 as uuidv4 } from 'uuid';

export class ObservabilityService {
    // Structured Logging
    async createLog(data: ICreateLogRequest): Promise<any> {
        const logId = uuidv4();

        const log = new LogEntry({
            logId,
            level: data.level,
            message: data.message,
            service: data.service,
            module: data.module,
            context: data.context || {},
            userId: data.userId,
            requestId: data.requestId
        });

        return await log.save();
    }

    async getLogs(filters: any): Promise<any[]> {
        const query: any = {};

        if (filters.level) query.level = filters.level;
        if (filters.service) query.service = filters.service;
        if (filters.userId) query.userId = filters.userId;
        if (filters.requestId) query.requestId = filters.requestId;

        return await LogEntry.find(query)
            .sort({ timestamp: -1 })
            .limit(filters.limit || 100);
    }

    // Distributed Tracing
    async createTrace(data: ICreateTraceRequest): Promise<any> {
        const traceId = uuidv4();

        // Calculate total duration
        const duration = data.spans.reduce((total, span) => {
            return total + (new Date(span.endTime).getTime() - new Date(span.startTime).getTime());
        }, 0);

        const trace = new Trace({
            traceId,
            serviceName: data.serviceName,
            operationName: data.operationName,
            spans: data.spans,
            duration,
            status: data.spans.some((s: any) => s.tags?.error) ? 'error' : 'success'
        });

        return await trace.save();
    }

    async getTraces(filters: any): Promise<any[]> {
        const query: any = {};

        if (filters.serviceName) query.serviceName = filters.serviceName;
        if (filters.status) query.status = filters.status;

        return await Trace.find(query)
            .sort({ timestamp: -1 })
            .limit(filters.limit || 50);
    }

    async getTrace(traceId: string): Promise<any> {
        const trace = await Trace.findOne({ traceId });

        if (!trace) {
            throw new AppError('Trace not found', 404);
        }

        return trace;
    }

    // Performance Monitoring
    async createMetric(data: ICreateMetricRequest): Promise<any> {
        const metricId = uuidv4();

        const metric = new PerformanceMetric({
            metricId,
            metricType: data.metricType,
            service: data.service,
            endpoint: data.endpoint,
            value: data.value,
            unit: data.unit,
            tags: data.tags || {}
        });

        return await metric.save();
    }

    async getMetrics(filters: any): Promise<any[]> {
        const query: any = {};

        if (filters.metricType) query.metricType = filters.metricType;
        if (filters.service) query.service = filters.service;
        if (filters.endpoint) query.endpoint = filters.endpoint;

        return await PerformanceMetric.find(query)
            .sort({ timestamp: -1 })
            .limit(filters.limit || 100);
    }

    async getMetricStats(metricType: string, service: string, timeRange: { from: Date; to: Date }): Promise<any> {
        const metrics = await PerformanceMetric.find({
            metricType,
            service,
            timestamp: { $gte: timeRange.from, $lte: timeRange.to }
        });

        if (metrics.length === 0) {
            return {
                count: 0,
                average: 0,
                min: 0,
                max: 0,
                p50: 0,
                p95: 0,
                p99: 0
            };
        }

        const values = metrics.map(m => m.value).sort((a, b) => a - b);
        const sum = values.reduce((a, b) => a + b, 0);

        return {
            count: values.length,
            average: sum / values.length,
            min: values[0],
            max: values[values.length - 1],
            p50: values[Math.floor(values.length * 0.5)],
            p95: values[Math.floor(values.length * 0.95)],
            p99: values[Math.floor(values.length * 0.99)]
        };
    }

    // Rate Limiting
    async checkRateLimit(data: ICheckRateLimitRequest): Promise<any> {
        const now = new Date();
        const windowStart = new Date(now.getTime() - 60000); // 1 minute window

        let rateLimit = await RateLimit.findOne({
            identifier: data.identifier,
            identifierType: data.identifierType,
            endpoint: data.endpoint,
            windowEnd: { $gt: now }
        });

        if (!rateLimit) {
            // Create new rate limit window
            const rateLimitId = uuidv4();
            rateLimit = new RateLimit({
                rateLimitId,
                identifier: data.identifier,
                identifierType: data.identifierType,
                endpoint: data.endpoint,
                requestCount: 1,
                windowStart: now,
                windowEnd: new Date(now.getTime() + 60000),
                limit: 100 // Default limit
            });
            await rateLimit.save();

            return {
                allowed: true,
                remaining: 99,
                resetAt: rateLimit.windowEnd
            };
        }

        // Update existing rate limit
        rateLimit.requestCount += 1;

        if (rateLimit.requestCount > rateLimit.limit) {
            rateLimit.isBlocked = true;
            await rateLimit.save();

            return {
                allowed: false,
                remaining: 0,
                resetAt: rateLimit.windowEnd
            };
        }

        await rateLimit.save();

        return {
            allowed: true,
            remaining: rateLimit.limit - rateLimit.requestCount,
            resetAt: rateLimit.windowEnd
        };
    }

    // Alert Management
    async createAlert(data: ICreateAlertRequest): Promise<any> {
        const alertId = uuidv4();

        const alert = new Alert({
            alertId,
            alertType: data.alertType,
            severity: data.severity,
            title: data.title,
            description: data.description,
            source: data.source,
            metadata: data.metadata || {}
        });

        return await alert.save();
    }

    async getAlerts(filters: any): Promise<any[]> {
        const query: any = {};

        if (filters.alertType) query.alertType = filters.alertType;
        if (filters.severity) query.severity = filters.severity;
        if (filters.status) query.status = filters.status;

        return await Alert.find(query)
            .sort({ createdAt: -1 })
            .limit(filters.limit || 50);
    }

    async acknowledgeAlert(alertId: string, userId: string): Promise<any> {
        const alert = await Alert.findOne({ alertId });

        if (!alert) {
            throw new AppError('Alert not found', 404);
        }

        return await Alert.findOneAndUpdate(
            { alertId },
            {
                status: 'acknowledged',
                acknowledgedBy: userId,
                acknowledgedAt: new Date()
            },
            { new: true }
        );
    }

    async resolveAlert(alertId: string, userId: string): Promise<any> {
        const alert = await Alert.findOne({ alertId });

        if (!alert) {
            throw new AppError('Alert not found', 404);
        }

        return await Alert.findOneAndUpdate(
            { alertId },
            {
                status: 'resolved',
                resolvedBy: userId,
                resolvedAt: new Date()
            },
            { new: true }
        );
    }

    // Security Event Logging
    async logSecurityEvent(data: ILogSecurityEventRequest): Promise<any> {
        const eventId = uuidv4();

        const event = new SecurityEvent({
            eventId,
            eventType: data.eventType,
            severity: data.severity,
            userId: data.userId,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            details: data.details
        });

        // Auto-create alert for high/critical security events
        if (data.severity === 'high' || data.severity === 'critical') {
            await this.createAlert({
                alertType: 'security',
                severity: data.severity,
                title: `Security Event: ${data.eventType}`,
                description: `Security event detected from IP ${data.ipAddress}`,
                source: 'security_monitor',
                metadata: { eventId, ...data.details }
            });
        }

        return await event.save();
    }

    async getSecurityEvents(filters: any): Promise<any[]> {
        const query: any = {};

        if (filters.eventType) query.eventType = filters.eventType;
        if (filters.severity) query.severity = filters.severity;
        if (filters.userId) query.userId = filters.userId;
        if (filters.ipAddress) query.ipAddress = filters.ipAddress;

        return await SecurityEvent.find(query)
            .sort({ timestamp: -1 })
            .limit(filters.limit || 100);
    }

    // Uptime Monitoring
    async createMonitor(serviceName: string, endpoint: string): Promise<any> {
        const monitorId = uuidv4();

        const monitor = new UptimeMonitor({
            monitorId,
            serviceName,
            endpoint
        });

        return await monitor.save();
    }

    async getMonitors(): Promise<any[]> {
        return await UptimeMonitor.find().sort({ serviceName: 1 });
    }

    async updateMonitorStatus(monitorId: string, status: string, responseTime?: number): Promise<any> {
        const monitor = await UptimeMonitor.findOne({ monitorId });

        if (!monitor) {
            throw new AppError('Monitor not found', 404);
        }

        const isSuccess = status === 'up';

        return await UptimeMonitor.findOneAndUpdate(
            { monitorId },
            {
                status,
                lastChecked: new Date(),
                responseTime,
                $inc: {
                    'uptime.totalChecks': 1,
                    'uptime.successfulChecks': isSuccess ? 1 : 0,
                    'uptime.failedChecks': isSuccess ? 0 : 1
                }
            },
            { new: true }
        ).then(async (updated) => {
            if (updated) {
                // Recalculate uptime percentage
                updated.uptime.percentage = (updated.uptime.successfulChecks / updated.uptime.totalChecks) * 100;
                await updated.save();
            }
            return updated;
        });
    }
}
