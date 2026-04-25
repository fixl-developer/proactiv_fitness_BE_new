import { Router, Request, Response } from 'express';
import { FeatureFlagsService } from './feature-flags.service';
import { FeatureFlagsModel } from './feature-flags.model';
import { authenticate, authorize } from '@modules/iam/auth.middleware';

const router = Router();
const featureFlagsService = new FeatureFlagsService();

const adminRoles = ['admin', 'super_admin', 'ADMIN', 'SUPER_ADMIN', 'REGIONAL_ADMIN'];

// =============================================
// REST CRUD endpoints used by the admin Feature Flags page
// (frontend FeatureFlagsService hits /feature-flags, /:id)
// =============================================

// GET /feature-flags  → paginated list
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const page = parseInt((req.query.page as string) || '1');
        const limit = parseInt((req.query.limit as string) || '20');
        const filter: any = {};
        if (req.query.search) {
            const term = String(req.query.search);
            filter.$or = [
                { name: { $regex: term, $options: 'i' } },
                { description: { $regex: term, $options: 'i' } },
                { flagId: { $regex: term, $options: 'i' } },
            ];
        }
        if (req.query.enabled !== undefined) filter.enabled = req.query.enabled === 'true';

        const [items, total] = await Promise.all([
            FeatureFlagsModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            FeatureFlagsModel.countDocuments(filter),
        ]);
        res.json({
            success: true,
            data: items,
            pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /feature-flags/:id
router.get('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const flag = await FeatureFlagsModel.findById(req.params.id).lean()
            || await FeatureFlagsModel.findOne({ flagId: req.params.id }).lean();
        if (!flag) return res.status(404).json({ success: false, error: 'Flag not found' });
        res.json({ success: true, data: flag });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /feature-flags
router.post('/', authenticate, authorize(adminRoles), async (req: Request, res: Response) => {
    try {
        const { name, description, enabled, rolloutPercentage, targetUsers } = req.body;
        if (!name) return res.status(400).json({ success: false, error: 'name is required' });

        const tenantId = req.user?.tenantId || 'default';
        const flag = await FeatureFlagsModel.create({
            flagId: `FF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
            tenantId,
            name,
            description: description || '',
            enabled: !!enabled,
            rolloutPercentage: typeof rolloutPercentage === 'number' ? rolloutPercentage : 100,
            targetUsers: Array.isArray(targetUsers) ? targetUsers : (typeof targetUsers === 'string' ? targetUsers.split(',').map(s => s.trim()).filter(Boolean) : []),
        });
        res.status(201).json({ success: true, data: flag, message: 'Feature flag created' });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /feature-flags/:id  (also keeps the existing /:flagId path below working)
router.put('/:id', authenticate, authorize(adminRoles), async (req: Request, res: Response) => {
    try {
        const update: any = {};
        ['name', 'description', 'enabled', 'rolloutPercentage', 'targetUsers'].forEach(k => {
            if (req.body[k] !== undefined) {
                if (k === 'targetUsers' && typeof req.body.targetUsers === 'string') {
                    update.targetUsers = req.body.targetUsers.split(',').map((s: string) => s.trim()).filter(Boolean);
                } else {
                    update[k] = req.body[k];
                }
            }
        });
        const flag = await FeatureFlagsModel.findByIdAndUpdate(req.params.id, update, { new: true })
            || await FeatureFlagsModel.findOneAndUpdate({ flagId: req.params.id }, update, { new: true });
        if (!flag) return res.status(404).json({ success: false, error: 'Flag not found' });
        res.json({ success: true, data: flag, message: 'Feature flag updated' });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /feature-flags/:id
router.delete('/:id', authenticate, authorize(adminRoles), async (req: Request, res: Response) => {
    try {
        const result = await FeatureFlagsModel.findByIdAndDelete(req.params.id)
            || await FeatureFlagsModel.findOneAndDelete({ flagId: req.params.id });
        if (!result) return res.status(404).json({ success: false, error: 'Flag not found' });
        res.json({ success: true, message: 'Feature flag deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =============================================
// Legacy / backward-compatible non-REST routes
// =============================================

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
