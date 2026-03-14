import { Router, Request, Response } from 'express';
import { APIPlatformAdvancedService } from './api-platform-advanced.service';
import { authMiddleware, roleMiddleware } from '../../middleware';

const router = Router();
const service = new APIPlatformAdvancedService();

// Create API key
router.post('/keys', authMiddleware, roleMiddleware(['DEVELOPER']), async (req: Request, res: Response) => {
    try {
        const key = await service.createAPIKey(req.body);
        res.json({ success: true, data: key });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get API keys
router.get('/keys', authMiddleware, async (req: Request, res: Response) => {
    try {
        const keys = await service.getAPIKeys(req.body.developerId);
        res.json({ success: true, data: keys });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get API documentation
router.get('/docs', async (req: Request, res: Response) => {
    try {
        const docs = await service.getAPIDocumentation();
        res.json({ success: true, data: docs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get SDK libraries
router.get('/sdks', async (req: Request, res: Response) => {
    try {
        const sdks = await service.getSDKLibraries();
        res.json({ success: true, data: sdks });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create OAuth app
router.post('/oauth/apps', authMiddleware, roleMiddleware(['DEVELOPER']), async (req: Request, res: Response) => {
    try {
        const app = await service.createOAuthApp(req.body);
        res.json({ success: true, data: app });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get rate limits
router.get('/rate-limits', authMiddleware, async (req: Request, res: Response) => {
    try {
        const limits = await service.getRateLimits(req.body.apiKey);
        res.json({ success: true, data: limits });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get API analytics
router.get('/analytics', authMiddleware, async (req: Request, res: Response) => {
    try {
        const analytics = await service.getAPIAnalytics(req.body.developerId);
        res.json({ success: true, data: analytics });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get developer portal
router.get('/portal', authMiddleware, async (req: Request, res: Response) => {
    try {
        const portal = await service.getDeveloperPortal(req.body.developerId);
        res.json({ success: true, data: portal });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
