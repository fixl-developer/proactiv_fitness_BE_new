import { Router, Request, Response } from 'express';
import { AISafetyMonitorService } from './ai-safety-monitor.service';
import { authenticate } from '@modules/iam/auth.middleware';

const router = Router();
const aiSafetyMonitorService = new AISafetyMonitorService();

// Get safety score
router.get('/safety-score/:locationId', authenticate, async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;
        const { locationId } = req.params;

        const result = await aiSafetyMonitorService.getSafetyScore(locationId, tenantId);

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get incident predictions
router.get('/incident-predictions', authenticate, async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;

        const result = await aiSafetyMonitorService.getIncidentPredictions(tenantId);

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get certification alerts
router.get('/certification-alerts', authenticate, async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;

        const result = await aiSafetyMonitorService.getCertificationAlerts(tenantId);

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get emergency guide
router.post('/emergency-guide', authenticate, async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;
        const { locationId, scenario, facilityType } = req.body;

        const result = await aiSafetyMonitorService.getEmergencyGuide({
            tenantId,
            locationId,
            scenario,
            facilityType,
        });

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Run compliance audit
router.post('/compliance-audit', authenticate, async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;
        const { locationId } = req.body;

        const result = await aiSafetyMonitorService.runComplianceAudit(locationId, tenantId);

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router;
