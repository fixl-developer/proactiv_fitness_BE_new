import { Router, Request, Response } from 'express';
import { AuditVaultService } from './audit-vault.service';
import { authenticate, authorize } from '@/middleware/auth';

const router = Router();
const auditService = new AuditVaultService();

// Log audit event
router.post('/log', authenticate, async (req: Request, res: Response) => {
    try {
        const { action, entityType, entityId, changes, reason } = req.body;
        const userId = req.user?.id;
        const tenantId = req.user?.tenantId;

        const auditLog = await auditService.logEvent({
            userId,
            tenantId,
            action,
            entityType,
            entityId,
            changes,
            reason,
        });

        res.json({ success: true, data: auditLog });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get audit logs
router.get('/logs', authenticate, authorize(['admin', 'super_admin']), async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;
        const { limit = 50, offset = 0, entityType, action } = req.query;

        const logs = await auditService.getLogs(tenantId, {
            limit: Number(limit),
            offset: Number(offset),
            entityType: entityType as string,
            action: action as string,
        });

        res.json({ success: true, data: logs });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get entity audit trail
router.get('/trail/:entityType/:entityId', authenticate, async (req: Request, res: Response) => {
    try {
        const { entityType, entityId } = req.params;

        const trail = await auditService.getEntityTrail(entityType, entityId);

        res.json({ success: true, data: trail });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router;
