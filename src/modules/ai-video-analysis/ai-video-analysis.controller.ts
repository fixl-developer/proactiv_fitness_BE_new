import { Router, Request, Response } from 'express';
import { AIVideoAnalysisService } from './ai-video-analysis.service';
import { authenticate } from '@modules/iam/auth.middleware';

const router = Router();
const videoAnalysisService = new AIVideoAnalysisService();

// Analyze a video for exercise form
router.post('/analyze-video', authenticate, async (req: Request, res: Response) => {
    try {
        const { studentId, exerciseType, videoUrl, description } = req.body;
        const tenantId = req.user?.tenantId;

        const result = await videoAnalysisService.analyzeVideo({
            tenantId,
            studentId,
            exerciseType,
            videoUrl,
            description,
        });

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get a specific analysis by ID
router.get('/analysis/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await videoAnalysisService.getAnalysis(id);

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get student analysis history
router.get('/student/:id/history', authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const tenantId = req.user?.tenantId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const result = await videoAnalysisService.getStudentHistory(id, tenantId, page, limit);

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Compare two analyses
router.post('/compare', authenticate, async (req: Request, res: Response) => {
    try {
        const { analysisId1, analysisId2 } = req.body;
        const tenantId = req.user?.tenantId;

        const result = await videoAnalysisService.compareAnalyses({
            tenantId,
            analysisId1,
            analysisId2,
        });

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router;
