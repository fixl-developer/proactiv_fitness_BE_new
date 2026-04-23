import { Router, Request, Response } from 'express';
import { AIContentEngineService } from './ai-content-engine.service';
import { authenticate } from '@modules/iam/auth.middleware';

const router = Router();
const aiContentEngineService = new AIContentEngineService();

// Generate social media post
router.post('/generate-social-post', authenticate, async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;
        const { topic, targetAudience, tone, platform } = req.body;

        const result = await aiContentEngineService.generateSocialPost({
            tenantId,
            topic,
            targetAudience,
            tone,
            platform,
        });

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Generate email campaign
router.post('/generate-email', authenticate, async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;
        const { topic, targetAudience, tone, campaignType } = req.body;

        const result = await aiContentEngineService.generateEmail({
            tenantId,
            topic,
            targetAudience,
            tone,
            campaignType,
        });

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Generate fitness article
router.post('/generate-article', authenticate, async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;
        const { topic, targetAudience, tone, wordCount } = req.body;

        const result = await aiContentEngineService.generateArticle({
            tenantId,
            topic,
            targetAudience,
            tone,
            wordCount,
        });

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Generate ad copy
router.post('/generate-ad-copy', authenticate, async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;
        const { topic, targetAudience, tone, adPlatform, budget } = req.body;

        const result = await aiContentEngineService.generateAdCopy({
            tenantId,
            topic,
            targetAudience,
            tone,
            adPlatform,
            budget,
        });

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get SEO suggestions
router.get('/seo-suggestions/:pageId', authenticate, async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;
        const { pageId } = req.params;

        const result = await aiContentEngineService.getSeoSuggestions(pageId, tenantId);

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router;
