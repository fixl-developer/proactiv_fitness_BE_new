import { Request, Response } from 'express';
import whiteLabelService from './white-label-saas.service';
import { asyncHandler } from '@/middleware/asyncHandler';

class WhiteLabelController {
    getTenants = asyncHandler(async (req: Request, res: Response) => {
        const tenants = await whiteLabelService.getTenants();
        res.json({ success: true, data: tenants });
    });

    createTenant = asyncHandler(async (req: Request, res: Response) => {
        const tenant = await whiteLabelService.createTenant(req.body);
        res.status(201).json({ success: true, data: tenant });
    });

    getTenantById = asyncHandler(async (req: Request, res: Response) => {
        const tenant = await whiteLabelService.getTenantById(req.params.id);
        res.json({ success: true, data: tenant });
    });

    updateTenant = asyncHandler(async (req: Request, res: Response) => {
        const tenant = await whiteLabelService.updateTenant(req.params.id, req.body);
        res.json({ success: true, data: tenant });
    });

    deleteTenant = asyncHandler(async (req: Request, res: Response) => {
        await whiteLabelService.deleteTenant(req.params.id);
        res.json({ success: true, message: 'Tenant deleted' });
    });

    getBranding = asyncHandler(async (req: Request, res: Response) => {
        const branding = await whiteLabelService.getBranding(req.params.tenantId);
        res.json({ success: true, data: branding });
    });

    updateBranding = asyncHandler(async (req: Request, res: Response) => {
        const branding = await whiteLabelService.updateBranding(req.params.tenantId, req.body);
        res.json({ success: true, data: branding });
    });

    getUsageMetrics = asyncHandler(async (req: Request, res: Response) => {
        const metrics = await whiteLabelService.getUsageMetrics(req.params.tenantId);
        res.json({ success: true, data: metrics });
    });

    getBillingInfo = asyncHandler(async (req: Request, res: Response) => {
        const billing = await whiteLabelService.getBillingInfo(req.params.tenantId);
        res.json({ success: true, data: billing });
    });

    updateBillingInfo = asyncHandler(async (req: Request, res: Response) => {
        const billing = await whiteLabelService.updateBillingInfo(req.params.tenantId, req.body);
        res.json({ success: true, data: billing });
    });

    getApiKeys = asyncHandler(async (req: Request, res: Response) => {
        const keys = await whiteLabelService.getApiKeys(req.params.tenantId);
        res.json({ success: true, data: keys });
    });

    generateApiKey = asyncHandler(async (req: Request, res: Response) => {
        const key = await whiteLabelService.generateApiKey(req.params.tenantId);
        res.json({ success: true, data: key });
    });

    revokeApiKey = asyncHandler(async (req: Request, res: Response) => {
        await whiteLabelService.revokeApiKey(req.params.keyId);
        res.json({ success: true, message: 'API key revoked' });
    });
}

export default new WhiteLabelController();
