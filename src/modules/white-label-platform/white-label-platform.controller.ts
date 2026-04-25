import { Router, Request, Response, NextFunction } from 'express';
import { WhiteLabelPlatformService } from './white-label-platform.service';
import { authenticate } from '@modules/iam/auth.middleware';
import { UserRole } from '@shared/enums';

const router = Router();
const service = new WhiteLabelPlatformService();

// Simple authorize middleware
const authorize = (roles: string[]) => (req: any, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
};

// Onboard new tenant
router.post('/tenants/onboard', authenticate, authorize(['ADMIN']), async (req: Request, res: Response) => {
    try {
        const tenant = await service.onboardTenant(req.body);
        res.json({ success: true, data: tenant });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get tenant details
router.get('/tenants/:tenantId', authenticate, async (req: Request, res: Response) => {
    try {
        const tenant = await service.getTenantDetails(req.params.tenantId);
        res.json({ success: true, data: tenant });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update tenant branding
router.put('/tenants/:tenantId/branding', authenticate, authorize(['ADMIN']), async (req: Request, res: Response) => {
    try {
        const branding = await service.updateTenantBranding(req.params.tenantId, req.body);
        res.json({ success: true, data: branding });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Configure custom domain
router.post('/tenants/:tenantId/domain', authenticate, authorize(['ADMIN']), async (req: Request, res: Response) => {
    try {
        const domain = await service.configureCustomDomain(req.params.tenantId, req.body.domain);
        res.json({ success: true, data: domain });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get tenant analytics
router.get('/tenants/:tenantId/analytics', authenticate, async (req: Request, res: Response) => {
    try {
        const analytics = await service.getTenantAnalytics(req.params.tenantId);
        res.json({ success: true, data: analytics });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Set usage-based pricing
router.post('/tenants/:tenantId/pricing', authenticate, authorize(['ADMIN']), async (req: Request, res: Response) => {
    try {
        const pricing = await service.setUsageBasedPricing(req.params.tenantId, req.body);
        res.json({ success: true, data: pricing });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get billing information
router.get('/tenants/:tenantId/billing', authenticate, async (req: Request, res: Response) => {
    try {
        const billing = await service.getBillingInformation(req.params.tenantId);
        res.json({ success: true, data: billing });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Manage tenant users
router.post('/tenants/:tenantId/users', authenticate, authorize(['ADMIN']), async (req: Request, res: Response) => {
    try {
        const user = await service.addTenantUser(req.params.tenantId, req.body);
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get tenant users
router.get('/tenants/:tenantId/users', authenticate, async (req: Request, res: Response) => {
    try {
        const users = await service.getTenantUsers(req.params.tenantId);
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Manage API access
router.post('/tenants/:tenantId/api-access', authenticate, authorize(['ADMIN']), async (req: Request, res: Response) => {
    try {
        const apiAccess = await service.manageAPIAccess(req.params.tenantId, req.body);
        res.json({ success: true, data: apiAccess });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all tenants
router.get('/tenants', authenticate, authorize(['ADMIN']), async (req: Request, res: Response) => {
    try {
        const tenants = await service.getAllTenants();
        res.json({ success: true, data: tenants });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
