import { Router, Request, Response } from 'express';
import apiService from './api-developer-platform.service';
import { authenticate, authorize } from '@modules/iam/auth.middleware';

const router = Router();

// Create API key
router.post('/keys/create', authenticate, authorize(['admin']), async (req: Request, res: Response) => {
    try {
        const { name, permissions, rateLimit } = req.body;
        const tenantId = req.user?.tenantId;

        const apiKey = await apiService.createAPIKey({
            tenantId,
            name,
            permissions,
            rateLimit,
        });

        res.json({ success: true, data: apiKey });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get API keys
router.get('/keys', authenticate, async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;

        const keys = await apiService.getAPIKeys(tenantId);

        res.json({ success: true, data: keys });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Revoke API key
router.post('/keys/:keyId/revoke', authenticate, authorize(['admin']), async (req: Request, res: Response) => {
    try {
        const { keyId } = req.params;

        await apiService.revokeAPIKey(keyId);

        res.json({ success: true });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router;
