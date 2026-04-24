import { Router, Request, Response } from 'express';
import { ParentAIAssistantService } from './parent-ai-assistant.service';
import { authenticate } from '@modules/iam/auth.middleware';

const router = Router();
const parentAIAssistantService = new ParentAIAssistantService();

// Generate progress report for a student
router.post('/generate-report/:studentId', authenticate, async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;
        const { period } = req.body;
        const tenantId = req.user?.tenantId;
        const parentId = req.user?.id || req.body.parentId;

        const result = await parentAIAssistantService.generateReport(studentId, tenantId, period, parentId);

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Parent Q&A
router.post('/ask', authenticate, async (req: Request, res: Response) => {
    try {
        const { studentId, question } = req.body;
        const tenantId = req.user?.tenantId;
        const parentId = req.user?.id || req.body.parentId;

        const result = await parentAIAssistantService.askQuestion({
            tenantId,
            parentId,
            studentId,
            question,
        });

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get milestones for a student
router.get('/milestones/:studentId', authenticate, async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;
        const tenantId = req.user?.tenantId;

        const result = await parentAIAssistantService.getMilestones(studentId, tenantId);

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Generate report card
router.post('/report-card/:studentId', authenticate, async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;
        const { termId } = req.body;
        const tenantId = req.user?.tenantId;
        const parentId = req.user?.id || req.body.parentId;

        const result = await parentAIAssistantService.generateReportCard(studentId, tenantId, termId, parentId);

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get AI-curated notifications
router.get('/notifications/:parentId', authenticate, async (req: Request, res: Response) => {
    try {
        const { parentId } = req.params;
        const tenantId = req.user?.tenantId;

        const result = await parentAIAssistantService.getNotifications(parentId, tenantId);

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router;
