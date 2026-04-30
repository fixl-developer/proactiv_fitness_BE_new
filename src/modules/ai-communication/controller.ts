import { Router, Request, Response } from 'express';
import { AICommunicationService } from './service';
import { authenticate } from '@modules/iam/auth.middleware';

const router = Router();
const service = new AICommunicationService();

// ─── POST /optimize-message ──────────────────────────────────────
router.post('/optimize-message', authenticate, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const { userId, originalMessage, targetAudience, channels, tone } = req.body;
    const result = await service.optimizeMessage({
      tenantId,
      userId: userId || req.user?.id,
      originalMessage,
      targetAudience,
      channels,
      tone,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── POST /best-time/:userId ─────────────────────────────────────
router.post('/best-time/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const { userId } = req.params;
    const result = await service.getBestTime(userId, tenantId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── POST /ab-test ───────────────────────────────────────────────
router.post('/ab-test', authenticate, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const { userId, campaignName, baseMessage, goal, variantCount } = req.body;
    const result = await service.createABTest({
      tenantId,
      userId,
      campaignName,
      baseMessage,
      goal,
      variantCount,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── GET /engagement-score/:userId ───────────────────────────────
router.get('/engagement-score/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const { userId } = req.params;
    const result = await service.getEngagementScore(userId, tenantId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── POST /predict-campaign ──────────────────────────────────────
router.post('/predict-campaign', authenticate, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const { campaignType, targetAudience, channel, messagePreview, scheduledTime } = req.body;
    const result = await service.predictCampaign({
      tenantId,
      campaignType,
      targetAudience,
      channel,
      messagePreview,
      scheduledTime,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
