import { Router, Request, Response } from 'express';
import { RevenueIntelligenceService } from './revenue-intelligence.service';
import { authenticate } from '@modules/iam/auth.middleware';

const router = Router();
const revenueIntelligenceService = new RevenueIntelligenceService();

// Get churn risk for a member
router.get('/churn-risk/:entityId', authenticate, async (req: Request, res: Response) => {
    try {
        const { entityId } = req.params;
        const tenantId = req.user?.tenantId;

        const result = await revenueIntelligenceService.getChurnRisk(entityId, tenantId);

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Trigger retention campaign
router.post('/retention-campaign', authenticate, async (req: Request, res: Response) => {
    try {
        const { targetSegment, budget, goals } = req.body;
        const tenantId = req.user?.tenantId;

        const result = await revenueIntelligenceService.triggerRetentionCampaign({
            tenantId,
            targetSegment,
            budget,
            goals,
        });

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get upsell opportunities
router.get('/upsell-opportunities', authenticate, async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;

        const result = await revenueIntelligenceService.getUpsellOpportunities(tenantId);

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Predict lifetime value
router.get('/ltv/:studentId', authenticate, async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;
        const tenantId = req.user?.tenantId;

        const result = await revenueIntelligenceService.predictLTV(studentId, tenantId);

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get revenue optimization suggestions
router.get('/optimization-suggestions', authenticate, async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;

        const result = await revenueIntelligenceService.getOptimizationSuggestions(tenantId);

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router;
