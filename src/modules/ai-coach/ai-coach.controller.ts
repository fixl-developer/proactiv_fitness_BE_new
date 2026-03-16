import { Router, Request, Response } from 'express';
import { AICoachService } from './ai-coach.service';
import { authenticate } from '@/middleware/auth';

const router = Router();
const aiCoachService = new AICoachService();

// Get AI recommendations
router.post('/recommendations', authenticate, async (req: Request, res: Response) => {
    try {
        const { studentId, performanceData, skillLevel } = req.body;
        const tenantId = req.user?.tenantId;

        const recommendations = await aiCoachService.getRecommendations({
            tenantId,
            studentId,
            performanceData,
            skillLevel,
        });

        res.json({ success: true, data: recommendations });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Analyze performance
router.post('/analyze', authenticate, async (req: Request, res: Response) => {
    try {
        const { studentId, performanceMetrics } = req.body;
        const tenantId = req.user?.tenantId;

        const analysis = await aiCoachService.analyzePerformance({
            tenantId,
            studentId,
            performanceMetrics,
        });

        res.json({ success: true, data: analysis });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get personalized coaching plan
router.get('/coaching-plan/:studentId', authenticate, async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;
        const tenantId = req.user?.tenantId;

        const plan = await aiCoachService.getCoachingPlan(tenantId, studentId);

        res.json({ success: true, data: plan });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router;
