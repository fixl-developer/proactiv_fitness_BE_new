import { Request, Response, NextFunction } from 'express';
import { ObservabilityService } from './observability.service';

const observabilityService = new ObservabilityService();

export class ObservabilityController {
    // Structured Logging
    async createLog(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const log = await observabilityService.createLog(req.body);

            res.status(201).json({
                success: true,
                message: 'Log created successfully',
                data: log
            });
        } catch (error) {
            next(error);
        }
    }

    async getLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters = {
                level: req.query.level as string,
                service: req.query.service as string,
                userId: req.query.userId as string,
                requestId: req.query.requestId as string,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 100
            };

            const logs = await observabilityService.getLogs(filters);

            res.status(200).json({
                success: true,
                message: 'Logs retrieved successfully',
                data: logs
            });
        } catch (error) {
            next(error);
        }
    }

    // Distributed Tracing
    async createTrace(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const trace = await observabilityService.createTrace(req.body);

            res.status(201).json({
                success: true,
                message: 'Trace created successfully',
                data: trace
            });
        } catch (error) {
            next(error);
        }
    }

    async getTraces(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters = {
                serviceName: req.query.serviceName as string,
                status: req.query.status as string,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 50
            };

            const traces = await observabilityService.getTraces(filters);

            res.status(200).json({
                success: true,
                message: 'Traces retrieved successfully',
                data: traces
            });
        } catch (error) {
            next(error);
        }
    }

    async getTrace(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { traceId } = req.params;
            const trace = await observabilityService.getTrace(traceId);

            res.status(200).json({
                success: true,
                message: 'Trace retrieved successfully',
                data: trace
            });
        } catch (error) {
            next(error);
        }
    }

    // Performance Monitoring
    async createMetric(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const metric = await observabilityService.createMetric(req.body);

            res.status(201).json({
                success: true,
                message: 'Metric created successfully',
                data: metric
            });
        } catch (error) {
            next(error);
        }
    }

    async getMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters = {
                metricType: req.query.metricType as string,
                service: req.query.service as string,
                endpoint: req.query.endpoint as string,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 100
            };

            const metrics = await observabilityService.getMetrics(filters);

            res.status(200).json({
                success: true,
                message: 'Metrics retrieved successfully',
                data: metrics
            });
        } catch (error) {
            next(error);
        }
    }

    async getMetricStats(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { metricType, service } = req.query;
            const timeRange = {
                from: new Date(req.query.from as string),
                to: new Date(req.query.to as string)
            };

            const stats = await observabilityService.getMetricStats(
                metricType as string,
                service as string,
                timeRange
            );

            res.status(200).json({
                success: true,
                message: 'Metric stats retrieved successfully',
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    // Rate Limiting
    async checkRateLimit(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await observabilityService.checkRateLimit(req.body);

            res.status(200).json({
                success: true,
                message: 'Rate limit checked',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Alert Management
    async createAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const alert = await observabilityService.createAlert(req.body);

            res.status(201).json({
                success: true,
                message: 'Alert created successfully',
                data: alert
            });
        } catch (error) {
            next(error);
        }
    }

    async getAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters = {
                alertType: req.query.alertType as string,
                severity: req.query.severity as string,
                status: req.query.status as string,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 50
            };

            const alerts = await observabilityService.getAlerts(filters);

            res.status(200).json({
                success: true,
                message: 'Alerts retrieved successfully',
                data: alerts
            });
        } catch (error) {
            next(error);
        }
    }

    async acknowledgeAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { alertId } = req.params;
            const userId = (req as any).user?.userId || 'system';
            const alert = await observabilityService.acknowledgeAlert(alertId, userId);

            res.status(200).json({
                success: true,
                message: 'Alert acknowledged successfully',
                data: alert
            });
        } catch (error) {
            next(error);
        }
    }

    async resolveAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { alertId } = req.params;
            const userId = (req as any).user?.userId || 'system';
            const alert = await observabilityService.resolveAlert(alertId, userId);

            res.status(200).json({
                success: true,
                message: 'Alert resolved successfully',
                data: alert
            });
        } catch (error) {
            next(error);
        }
    }

    // Security Event Logging
    async logSecurityEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const event = await observabilityService.logSecurityEvent(req.body);

            res.status(201).json({
                success: true,
                message: 'Security event logged successfully',
                data: event
            });
        } catch (error) {
            next(error);
        }
    }

    async getSecurityEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters = {
                eventType: req.query.eventType as string,
                severity: req.query.severity as string,
                userId: req.query.userId as string,
                ipAddress: req.query.ipAddress as string,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 100
            };

            const events = await observabilityService.getSecurityEvents(filters);

            res.status(200).json({
                success: true,
                message: 'Security events retrieved successfully',
                data: events
            });
        } catch (error) {
            next(error);
        }
    }

    // Uptime Monitoring
    async createMonitor(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { serviceName, endpoint } = req.body;
            const monitor = await observabilityService.createMonitor(serviceName, endpoint);

            res.status(201).json({
                success: true,
                message: 'Monitor created successfully',
                data: monitor
            });
        } catch (error) {
            next(error);
        }
    }

    async getMonitors(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const monitors = await observabilityService.getMonitors();

            res.status(200).json({
                success: true,
                message: 'Monitors retrieved successfully',
                data: monitors
            });
        } catch (error) {
            next(error);
        }
    }

    async updateMonitorStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { monitorId } = req.params;
            const { status, responseTime } = req.body;
            const monitor = await observabilityService.updateMonitorStatus(monitorId, status, responseTime);

            res.status(200).json({
                success: true,
                message: 'Monitor status updated successfully',
                data: monitor
            });
        } catch (error) {
            next(error);
        }
    }
}
