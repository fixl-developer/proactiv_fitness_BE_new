import { Router } from 'express';
import { ObservabilityController } from './observability.controller';

const router = Router();
const observabilityController = new ObservabilityController();

// Structured Logging
router.post('/logs', observabilityController.createLog);
router.get('/logs', observabilityController.getLogs);

// Distributed Tracing
router.post('/traces', observabilityController.createTrace);
router.get('/traces', observabilityController.getTraces);
router.get('/traces/:traceId', observabilityController.getTrace);

// Performance Monitoring
router.post('/metrics', observabilityController.createMetric);
router.get('/metrics', observabilityController.getMetrics);
router.get('/metrics/stats', observabilityController.getMetricStats);

// Rate Limiting
router.post('/rate-limit/check', observabilityController.checkRateLimit);

// Alert Management
router.post('/alerts', observabilityController.createAlert);
router.get('/alerts', observabilityController.getAlerts);
router.post('/alerts/:alertId/acknowledge', observabilityController.acknowledgeAlert);
router.post('/alerts/:alertId/resolve', observabilityController.resolveAlert);

// Security Event Logging
router.post('/security-events', observabilityController.logSecurityEvent);
router.get('/security-events', observabilityController.getSecurityEvents);

// Uptime Monitoring
router.post('/monitors', observabilityController.createMonitor);
router.get('/monitors', observabilityController.getMonitors);
router.put('/monitors/:monitorId/status', observabilityController.updateMonitorStatus);

export default router;
