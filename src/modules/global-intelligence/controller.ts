import { Router, Request, Response } from 'express';
import { GlobalIntelligenceService } from './service';
import { authenticate } from '@modules/iam/auth.middleware';

const router = Router();
const service = new GlobalIntelligenceService();

// ─── GET /benchmarks ─────────────────────────────────────────────
router.get('/benchmarks', authenticate, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const result = await service.getBenchmarks(tenantId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── GET /best-practices ─────────────────────────────────────────
router.get('/best-practices', authenticate, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const result = await service.getBestPractices(tenantId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── GET /global-forecast ────────────────────────────────────────
router.get('/global-forecast', authenticate, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const result = await service.getGlobalForecast(tenantId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── POST /optimize-resources ────────────────────────────────────
router.post('/optimize-resources', authenticate, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const { locations, budget } = req.body;
    const result = await service.optimizeResources({
      tenantId,
      locations,
      budget,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── GET /expansion-opportunities ────────────────────────────────
router.get('/expansion-opportunities', authenticate, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const result = await service.getExpansionOpportunities(tenantId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
