import { Router, Request, Response } from 'express';
import { AdvancedVideoProcessingService } from './advanced-video-processing.service';
import { authenticate, authorize } from '@modules/iam/auth.middleware';

const router = Router();
const service = new AdvancedVideoProcessingService();

// Upload video
router.post('/upload', authenticate, authorize(['COACH']), async (req: Request, res: Response) => {
    try {
        const video = await service.uploadVideo(req.body);
        res.json({ success: true, data: video });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Process video
router.post('/process/:videoId', authenticate, authorize(['ADMIN']), async (req: Request, res: Response) => {
    try {
        const result = await service.processVideo(req.params.videoId, req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get video
router.get('/:videoId', authenticate, async (req: Request, res: Response) => {
    try {
        const video = await service.getVideo(req.params.videoId);
        res.json({ success: true, data: video });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Transcode video
router.post('/:videoId/transcode', authenticate, authorize(['ADMIN']), async (req: Request, res: Response) => {
    try {
        const result = await service.transcodeVideo(req.params.videoId, req.body.format);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get video analytics
router.get('/:videoId/analytics', authenticate, async (req: Request, res: Response) => {
    try {
        const analytics = await service.getVideoAnalytics(req.params.videoId);
        res.json({ success: true, data: analytics });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
