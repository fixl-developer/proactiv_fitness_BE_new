import { Router, Request, Response } from 'express';
import { FeatureFlagsService } from './feature-flags.service';
import { authenticate, authorize } from '@/middleware/auth';

const router = Router();
const featureFlagsService = new FeatureFlagsService();

// Create feature flag
router.post('/create', authenticate, authorize(['admin', 'super_admin']), async (req: Request, res: Response) => {
    try {
        const { name, description, enabled, rolloutPercentage, targetUsers } = req.body;
        const tenantId = req.user?.tenantId;

        const flag = await featureFlagsService.createFlag({
            tenantId,
            name,
            description,
            enabled,
            rolloutPercentage,
            targetUsers,
        });

        res.json({ success: true, data: flag });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get feature flags
router.get('/list', authenticate, async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;

        const flags = await featureFlagsService.getFlags(tenantId);

        res.json({ success: true, data: flags });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Check if feature is enabled
router.get('/check/:featureName', authenticate, async (req: Request, res: Response) => {
    try {
        const { featureName } = req.params;
        const userId = req.user?.id;
        const tenantId = req.user?.tenantId;

        const isEnabled = await featureFlagsService.isFeatureEnabled(tenantId, featureName, userId);

        res.json({ success: true, data: { enabled: isEnabled } });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Update feature flag
router.put('/:flagId', authenticate, authorize(['admin', 'super_admin']), async (req: Request, res: Response) => {
    try {
        const { flagId } = req.params;
        const updates = req.body;

        const flag = await featureFlagsService.updateFlag(flagId, updates);

        res.json({ success: true, data: flag });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router;
