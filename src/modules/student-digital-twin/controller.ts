import { Router, Request, Response } from 'express';
import { StudentDigitalTwinService } from './service';
import { authenticate } from '@modules/iam/auth.middleware';

const router = Router();
const service = new StudentDigitalTwinService();

// ─── GET /profile/:studentId ─────────────────────────────────────
router.get('/profile/:studentId', authenticate, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const { studentId } = req.params;
    const result = await service.getProfile(studentId, tenantId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── POST /learning-path/:studentId ──────────────────────────────
router.post('/learning-path/:studentId', authenticate, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const { studentId } = req.params;
    const result = await service.generateLearningPath(studentId, tenantId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── GET /skill-gaps/:studentId ──────────────────────────────────
router.get('/skill-gaps/:studentId', authenticate, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const { studentId } = req.params;
    const result = await service.getSkillGaps(studentId, tenantId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── GET /competition-readiness/:studentId ───────────────────────
router.get('/competition-readiness/:studentId', authenticate, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const { studentId } = req.params;
    const result = await service.getCompetitionReadiness(studentId, tenantId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── POST /development-roadmap/:studentId ────────────────────────
router.post('/development-roadmap/:studentId', authenticate, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const { studentId } = req.params;
    const { horizon } = req.body;
    const result = await service.generateDevelopmentRoadmap(studentId, tenantId, horizon);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
