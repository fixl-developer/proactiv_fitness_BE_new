import { Router, Request, Response } from 'express';
import { AIGamificationEngineService } from './service';
import { authenticate } from '@modules/iam/auth.middleware';

const router = Router();
const service = new AIGamificationEngineService();

// ─── POST /generate-challenges/:studentId ────────────────────────
router.post('/generate-challenges/:studentId', authenticate, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const { studentId } = req.params;
    const result = await service.generateChallenges(studentId, tenantId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── POST /adjust-difficulty ─────────────────────────────────────
router.post('/adjust-difficulty', authenticate, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const { studentId, currentLevel, recentPerformance } = req.body;
    const result = await service.adjustDifficulty({
      tenantId,
      studentId,
      currentLevel,
      recentPerformance,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── POST /balance-teams ─────────────────────────────────────────
router.post('/balance-teams', authenticate, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const { participants, teamCount, activityType } = req.body;
    const result = await service.balanceTeams({
      tenantId,
      participants,
      teamCount,
      activityType,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── GET /reward-timing/:studentId ───────────────────────────────
router.get('/reward-timing/:studentId', authenticate, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const { studentId } = req.params;
    const result = await service.getRewardTiming(studentId, tenantId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── GET /streak-risk/:studentId ─────────────────────────────────
router.get('/streak-risk/:studentId', authenticate, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const { studentId } = req.params;
    const result = await service.getStreakRisk(studentId, tenantId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
