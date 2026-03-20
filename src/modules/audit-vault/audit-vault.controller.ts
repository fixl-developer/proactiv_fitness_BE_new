import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '@modules/iam/auth.middleware';
import { AuditVaultModel } from './audit-vault.model';
import { UserRole } from '@shared/enums';
import logger from '@shared/utils/logger.util';

const router = Router();

// ────────────────────────────────────────────────────────────────────────────
// POST /audit/log — Record a manual audit event
// ────────────────────────────────────────────────────────────────────────────
router.post('/log', authenticate, async (req: Request, res: Response) => {
    try {
        const { action, entityType, entityId, changes, reason } = req.body;

        const auditEntry = await AuditVaultModel.create({
            auditId: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            tenantId: (req as any).user?.tenantId || 'default',
            userId: (req as any).user?.id || 'anonymous',
            action,
            entityType,
            entityId: entityId || 'N/A',
            changes: changes || {},
            reason,
            ipAddress: req.ip || req.socket?.remoteAddress || '',
            userAgent: req.get('User-Agent') || '',
        });

        res.json({ success: true, data: { message: 'Audit log recorded', id: auditEntry._id } });
    } catch (error: any) {
        logger.error('Failed to create manual audit log', { error });
        res.status(400).json({ success: false, error: error.message });
    }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /audit/logs — Paginated, filterable audit log listing (admin only)
//
// Query parameters:
//   page       — page number (default 1)
//   limit      — results per page (default 20, max 100)
//   action     — filter by action type (e.g. USER_CREATE, LOGIN)
//   userId     — filter by actor user ID
//   entityType — filter by entity type (e.g. User, Auth)
//   startDate  — ISO-8601 lower bound for createdAt
//   endDate    — ISO-8601 upper bound for createdAt
//   search     — free-text search across action, entityType, entityId
// ────────────────────────────────────────────────────────────────────────────
router.get(
    '/logs',
    authenticate,
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    async (req: Request, res: Response) => {
        try {
            const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
            const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
            const skip = (page - 1) * limit;

            // Build dynamic filter
            const filter: Record<string, any> = {};

            if (req.query.action) {
                filter.action = req.query.action;
            }

            if (req.query.userId) {
                filter.userId = req.query.userId;
            }

            if (req.query.entityType) {
                filter.entityType = req.query.entityType;
            }

            // Date range
            if (req.query.startDate || req.query.endDate) {
                filter.createdAt = {};
                if (req.query.startDate) {
                    filter.createdAt.$gte = new Date(req.query.startDate as string);
                }
                if (req.query.endDate) {
                    filter.createdAt.$lte = new Date(req.query.endDate as string);
                }
            }

            // Free-text search
            if (req.query.search) {
                const searchRegex = { $regex: req.query.search as string, $options: 'i' };
                filter.$or = [
                    { action: searchRegex },
                    { entityType: searchRegex },
                    { entityId: searchRegex },
                    { userId: searchRegex },
                ];
            }

            // Tenant isolation: non-ADMIN users only see their own tenant
            const userRole = (req as any).user?.role;
            const userTenantId = (req as any).user?.tenantId;
            if (userRole !== UserRole.ADMIN && userTenantId) {
                filter.tenantId = userTenantId;
            }

            const [logs, total] = await Promise.all([
                AuditVaultModel.find(filter)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                AuditVaultModel.countDocuments(filter),
            ]);

            res.json({
                success: true,
                data: {
                    logs,
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            });
        } catch (error: any) {
            logger.error('Failed to fetch audit logs', { error });
            res.status(400).json({ success: false, error: error.message });
        }
    }
);

// ────────────────────────────────────────────────────────────────────────────
// GET /audit/trail/:entityType/:entityId — Entity-specific audit trail
// ────────────────────────────────────────────────────────────────────────────
router.get(
    '/trail/:entityType/:entityId',
    authenticate,
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    async (req: Request, res: Response) => {
        try {
            const { entityType, entityId } = req.params;
            const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
            const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
            const skip = (page - 1) * limit;

            const filter: Record<string, any> = { entityType, entityId };

            // Tenant isolation
            const userRole = (req as any).user?.role;
            const userTenantId = (req as any).user?.tenantId;
            if (userRole !== UserRole.ADMIN && userTenantId) {
                filter.tenantId = userTenantId;
            }

            const [logs, total] = await Promise.all([
                AuditVaultModel.find(filter)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                AuditVaultModel.countDocuments(filter),
            ]);

            res.json({
                success: true,
                data: {
                    logs,
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            });
        } catch (error: any) {
            logger.error('Failed to fetch entity audit trail', { error });
            res.status(400).json({ success: false, error: error.message });
        }
    }
);

// ────────────────────────────────────────────────────────────────────────────
// GET /audit/stats — Aggregate statistics for the admin dashboard
// ────────────────────────────────────────────────────────────────────────────
router.get(
    '/stats',
    authenticate,
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    async (req: Request, res: Response) => {
        try {
            const now = new Date();
            const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            const filter: Record<string, any> = {};
            const userRole = (req as any).user?.role;
            const userTenantId = (req as any).user?.tenantId;
            if (userRole !== UserRole.ADMIN && userTenantId) {
                filter.tenantId = userTenantId;
            }

            const [totalLogs, last24hCount, last7dCount, actionBreakdown] = await Promise.all([
                AuditVaultModel.countDocuments(filter),
                AuditVaultModel.countDocuments({ ...filter, createdAt: { $gte: last24h } }),
                AuditVaultModel.countDocuments({ ...filter, createdAt: { $gte: last7d } }),
                AuditVaultModel.aggregate([
                    { $match: { ...filter, createdAt: { $gte: last7d } } },
                    { $group: { _id: '$action', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 20 },
                ]),
            ]);

            res.json({
                success: true,
                data: {
                    totalLogs,
                    last24hCount,
                    last7dCount,
                    actionBreakdown: actionBreakdown.map((a) => ({
                        action: a._id,
                        count: a.count,
                    })),
                },
            });
        } catch (error: any) {
            logger.error('Failed to fetch audit stats', { error });
            res.status(400).json({ success: false, error: error.message });
        }
    }
);

export default router;
