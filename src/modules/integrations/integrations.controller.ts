import { Router, Request, Response } from 'express';
import { IntegrationsService } from './integrations.service';
import { authenticate, authorize } from '@/middleware/auth';

const router = Router();
const integrationsService = new IntegrationsService();

// Create integration
router.post('/create', authenticate, authorize(['admin']), async (req: Request, res: Response) => {
    try {
        const { provider, credentials, config } = req.body;
        const tenantId = req.user?.tenantId;

        const integration = await integrationsService.createIntegration({
            tenantId,
            provider,
            credentials,
            config,
        });

        res.json({ success: true, data: integration });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get integrations
router.get('/list', authenticate, async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;

        const integrations = await integrationsService.getIntegrations(tenantId);

        res.json({ success: true, data: integrations });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Test integration
router.post('/:integrationId/test', authenticate, async (req: Request, res: Response) => {
    try {
        const { integrationId } = req.params;

        const result = await integrationsService.testIntegration(integrationId);

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Webhook handler
router.post('/webhook/:provider', async (req: Request, res: Response) => {
    try {
        const { provider } = req.params;
        const event = req.body;

        await integrationsService.handleWebhook(provider, event);

        res.json({ success: true });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router;
