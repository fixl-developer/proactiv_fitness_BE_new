import { Router } from 'express';
import whiteLabelController from './white-label-saas.controller';
import { authenticate, authorize } from '@modules/iam/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/tenants', whiteLabelController.getTenants);
router.post('/tenants', whiteLabelController.createTenant);
router.get('/tenants/:id', whiteLabelController.getTenantById);
router.put('/tenants/:id', whiteLabelController.updateTenant);
router.delete('/tenants/:id', whiteLabelController.deleteTenant);

router.get('/tenants/:tenantId/branding', whiteLabelController.getBranding);
router.put('/tenants/:tenantId/branding', whiteLabelController.updateBranding);

router.get('/tenants/:tenantId/usage', whiteLabelController.getUsageMetrics);

router.get('/tenants/:tenantId/billing', whiteLabelController.getBillingInfo);
router.put('/tenants/:tenantId/billing', whiteLabelController.updateBillingInfo);

router.get('/tenants/:tenantId/api-keys', whiteLabelController.getApiKeys);
router.post('/tenants/:tenantId/api-keys', whiteLabelController.generateApiKey);
router.delete('/api-keys/:keyId', whiteLabelController.revokeApiKey);

export default router;
