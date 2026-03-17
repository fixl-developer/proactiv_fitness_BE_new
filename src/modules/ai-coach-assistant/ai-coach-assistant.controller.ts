import { Router, Request, Response } from 'express';
import { AICoachAssistantService } from './ai-coach-assistant.service';
import { authenticate } from '@modules/iam/auth.middleware';

const router = Router();
const assistantService = new AICoachAssistantService();

// Analyze form
router.post('/analyze-form', authenticate, async (req: Request, res: Response) => {
    try {
        const { videoUrl, exerciseType, studentId } = req.body;
        const tenantId = req.user?.tenantId;

        const analysis = await assistantService.analyzeForm({
            tenantId,
            studentId,
            videoUrl,
            exerciseType,
        });

        res.json({ success: true, data: analysis });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get form correction suggestions
router.get('/corrections/:studentId', authenticate, async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;
        const tenantId = req.user?.tenantId;

        const corrections = await assistantService.getCorrections(tenantId, studentId);

        res.json({ success: true, data: corrections });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router;
