import { Router, Request, Response } from 'express';
import { AdvancedAnalyticsService } from './advanced-analytics.service';
import { authenticate, authorize } from '@modules/iam/auth.middleware';

const router = Router();
const service = new AdvancedAnalyticsService();

// Get predictive analytics
router.get('/predictive/:entityId', authenticate, async (req: Request, res: Response) => {
    try {
        const analytics = await service.getPredictiveAnalytics(req.params.entityId);
        res.json({ success: true, data: analytics });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get ML models
router.get('/models', authenticate, authorize(['ADMIN']), async (req: Request, res: Response) => {
    try {
        const models = await service.getMLModels();
        res.json({ success: true, data: models });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get advanced dashboards
router.get('/dashboards/:userId', authenticate, async (req: Request, res: Response) => {
    try {
        const dashboards = await service.getAdvancedDashboards(req.params.userId);
        res.json({ success: true, data: dashboards });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get real-time insights
router.get('/insights', authenticate, async (req: Request, res: Response) => {
    try {
        const insights = await service.getRealTimeInsights();
        res.json({ success: true, data: insights });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get trend analysis
router.get('/trends/:metric', authenticate, async (req: Request, res: Response) => {
    try {
        const trends = await service.getTrendAnalysis(req.params.metric);
        res.json({ success: true, data: trends });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Detect anomalies
router.post('/anomalies/detect', authenticate, authorize(['ADMIN']), async (req: Request, res: Response) => {
    try {
        const anomalies = await service.detectAnomalies(req.body);
        res.json({ success: true, data: anomalies });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get custom visualizations
router.post('/visualizations', authenticate, async (req: Request, res: Response) => {
    try {
        const visualization = await service.createCustomVisualization(req.body);
        res.json({ success: true, data: visualization });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
