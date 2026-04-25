import { Router, Request, Response } from 'express';
import { ParentEngagementService } from './parent-engagement.service';
import { authenticate as authMiddleware, authorize } from '@modules/iam/auth.middleware';
const roleMiddleware = (roles: string[] | string) => authorize(...(Array.isArray(roles) ? roles : [roles]) as any);

const router = Router();
const service = new ParentEngagementService();

// Generate progress video
router.post('/videos/generate', authMiddleware, roleMiddleware(['PARENT', 'COACH']), async (req: Request, res: Response) => {
    try {
        const { childId, period, includePhotos, includeMetrics } = req.body;
        const video = await service.generateProgressVideo(childId, period, includePhotos, includeMetrics);
        res.json({ success: true, data: video });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get progress videos
router.get('/videos/:childId', authMiddleware, async (req: Request, res: Response) => {
    try {
        const videos = await service.getProgressVideos(req.params.childId);
        res.json({ success: true, data: videos });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Share video with family
router.post('/videos/:videoId/share', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { recipientEmails, message } = req.body;
        const result = await service.shareVideo(req.params.videoId, recipientEmails, message);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create milestone celebration
router.post('/milestones', authMiddleware, roleMiddleware(['COACH']), async (req: Request, res: Response) => {
    try {
        const milestone = await service.createMilestone(req.body);
        res.json({ success: true, data: milestone });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get milestones for child
router.get('/milestones/:childId', authMiddleware, async (req: Request, res: Response) => {
    try {
        const milestones = await service.getMilestones(req.params.childId);
        res.json({ success: true, data: milestones });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create parent education content
router.post('/education', authMiddleware, roleMiddleware(['ADMIN', 'COACH']), async (req: Request, res: Response) => {
    try {
        const content = await service.createEducationContent(req.body);
        res.json({ success: true, data: content });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get education content
router.get('/education', authMiddleware, async (req: Request, res: Response) => {
    try {
        const content = await service.getEducationContent();
        res.json({ success: true, data: content });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create progress report
router.post('/reports', authMiddleware, roleMiddleware(['COACH']), async (req: Request, res: Response) => {
    try {
        const report = await service.createProgressReport(req.body);
        res.json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get progress reports
router.get('/reports/:childId', authMiddleware, async (req: Request, res: Response) => {
    try {
        const reports = await service.getProgressReports(req.params.childId);
        res.json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Schedule parent workshop
router.post('/workshops', authMiddleware, roleMiddleware(['ADMIN', 'COACH']), async (req: Request, res: Response) => {
    try {
        const workshop = await service.scheduleWorkshop(req.body);
        res.json({ success: true, data: workshop });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get workshops
router.get('/workshops', authMiddleware, async (req: Request, res: Response) => {
    try {
        const workshops = await service.getWorkshops();
        res.json({ success: true, data: workshops });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update communication preferences
router.put('/preferences/:parentId', authMiddleware, async (req: Request, res: Response) => {
    try {
        const preferences = await service.updateCommunicationPreferences(req.params.parentId, req.body);
        res.json({ success: true, data: preferences });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Collect feedback
router.post('/feedback', authMiddleware, roleMiddleware(['PARENT']), async (req: Request, res: Response) => {
    try {
        const feedback = await service.collectFeedback(req.body);
        res.json({ success: true, data: feedback });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get satisfaction survey
router.get('/surveys/:parentId', authMiddleware, async (req: Request, res: Response) => {
    try {
        const survey = await service.getSatisfactionSurvey(req.params.parentId);
        res.json({ success: true, data: survey });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
