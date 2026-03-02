import { Router } from 'express';
import { IntegrationController } from './integration.controller';

const router = Router();
const integrationController = new IntegrationController();

// Integration Management
router.post('/integrations', integrationController.createIntegration);
router.get('/integrations', integrationController.getIntegrations);
router.get('/integrations/:integrationId', integrationController.getIntegration);
router.put('/integrations/:integrationId', integrationController.updateIntegration);
router.delete('/integrations/:integrationId', integrationController.deleteIntegration);

// Integration Operations
router.post('/integrations/call', integrationController.callIntegration);
router.post('/integrations/:integrationId/health-check', integrationController.performHealthCheck);

// Webhook Management
router.post('/webhooks', integrationController.receiveWebhook);
router.get('/integrations/:integrationId/webhooks', integrationController.getWebhooks);

// Logs
router.get('/integrations/:integrationId/logs', integrationController.getIntegrationLogs);

export default router;
