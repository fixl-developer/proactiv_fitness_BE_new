import { Router, Request, Response } from 'express';
import { Schema, model, models } from 'mongoose';

/**
 * Dynamic Roles & Permissions CRUD
 * ---------------------------------
 * These are *custom* (admin-defined) roles and permissions, stored in MongoDB.
 * They are separate from the hard-coded UserRole enum which drives auth middleware.
 *
 * Collections:
 *  - iam_roles        — custom roles with name, description, permissions[]
 *  - iam_permissions  — permissions with name, module, action, description
 *
 * The frontend "Role & Permissions" page (/admin/users/roles) consumes these.
 */

// ---------------------------------------------------------------------------
// Mongoose models (lazy-created, guarded against hot-reload re-registration)
// ---------------------------------------------------------------------------
const roleSchema = new Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        description: { type: String, trim: true, default: '' },
        permissions: { type: [String], default: [] },
        isSystem: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const permissionSchema = new Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        description: { type: String, trim: true, default: '' },
        module: { type: String, required: true, trim: true },
        action: { type: String, required: true, trim: true },
        isSystem: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const IamRole = models.IamRole || model('IamRole', roleSchema, 'iam_roles');
const IamPermission =
    models.IamPermission || model('IamPermission', permissionSchema, 'iam_permissions');

// ---------------------------------------------------------------------------
// Default system roles + permissions — seeded on first query when empty
// ---------------------------------------------------------------------------
const DEFAULT_PERMISSIONS = [
    { name: 'users.view', module: 'users', action: 'view', description: 'View user records' },
    { name: 'users.create', module: 'users', action: 'create', description: 'Create new users' },
    { name: 'users.edit', module: 'users', action: 'edit', description: 'Edit existing users' },
    { name: 'users.delete', module: 'users', action: 'delete', description: 'Delete users' },
    { name: 'roles.view', module: 'roles', action: 'view', description: 'View roles' },
    { name: 'roles.create', module: 'roles', action: 'create', description: 'Create roles' },
    { name: 'roles.edit', module: 'roles', action: 'edit', description: 'Edit roles' },
    { name: 'roles.delete', module: 'roles', action: 'delete', description: 'Delete roles' },
    { name: 'cms.view', module: 'cms', action: 'view', description: 'View CMS content' },
    { name: 'cms.edit', module: 'cms', action: 'edit', description: 'Edit CMS content' },
    { name: 'bookings.view', module: 'bookings', action: 'view', description: 'View bookings' },
    { name: 'bookings.manage', module: 'bookings', action: 'manage', description: 'Manage bookings' },
    { name: 'reports.view', module: 'reports', action: 'view', description: 'View reports' },
    { name: 'settings.view', module: 'settings', action: 'view', description: 'View settings' },
    { name: 'settings.edit', module: 'settings', action: 'edit', description: 'Edit settings' },
    { name: 'payments.view', module: 'payments', action: 'view', description: 'View payments' },
    { name: 'payments.manage', module: 'payments', action: 'manage', description: 'Manage payments' },
    { name: 'staff.view', module: 'staff', action: 'view', description: 'View staff' },
    { name: 'staff.manage', module: 'staff', action: 'manage', description: 'Manage staff' },
];

const DEFAULT_ROLES = [
    {
        name: 'ADMIN',
        description: 'Full system access',
        permissions: DEFAULT_PERMISSIONS.map((p) => p.name),
        isSystem: true,
    },
    {
        name: 'REGIONAL_ADMIN',
        description: 'Regional management access',
        permissions: [
            'users.view',
            'users.create',
            'users.edit',
            'roles.view',
            'bookings.view',
            'bookings.manage',
            'reports.view',
            'staff.view',
            'staff.manage',
        ],
        isSystem: true,
    },
    {
        name: 'FRANCHISE_OWNER',
        description: 'Franchise management access',
        permissions: ['users.view', 'bookings.view', 'bookings.manage', 'reports.view', 'staff.view'],
        isSystem: true,
    },
    {
        name: 'LOCATION_MANAGER',
        description: 'Location-level management',
        permissions: ['users.view', 'bookings.view', 'bookings.manage', 'staff.view'],
        isSystem: true,
    },
    {
        name: 'COACH',
        description: 'Coaching and class management',
        permissions: ['bookings.view', 'staff.view'],
        isSystem: true,
    },
    {
        name: 'SUPPORT_STAFF',
        description: 'Customer support access',
        permissions: ['users.view', 'bookings.view'],
        isSystem: true,
    },
    {
        name: 'PARTNER_ADMIN',
        description: 'Partner portal access',
        permissions: ['bookings.view', 'reports.view'],
        isSystem: true,
    },
    {
        name: 'PARENT',
        description: 'Parent/guardian access',
        permissions: [],
        isSystem: true,
    },
    {
        name: 'STUDENT',
        description: 'Student access',
        permissions: [],
        isSystem: true,
    },
    {
        name: 'USER',
        description: 'Basic user access',
        permissions: [],
        isSystem: true,
    },
];

let seeded = false;
async function ensureSeeded() {
    if (seeded) return;
    try {
        const permCount = await IamPermission.estimatedDocumentCount();
        if (permCount === 0) {
            await IamPermission.insertMany(
                DEFAULT_PERMISSIONS.map((p) => ({ ...p, isSystem: true }))
            );
        }
        const roleCount = await IamRole.estimatedDocumentCount();
        if (roleCount === 0) {
            await IamRole.insertMany(DEFAULT_ROLES);
        }
        seeded = true;
    } catch {
        // If seed fails (e.g. transient DB issue), we'll retry next call
    }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function normalizeDoc(doc: any): any {
    if (!doc) return doc;
    const plain: any = (doc as any).toObject ? (doc as any).toObject() : { ...doc };
    if (plain._id) {
        plain.id = String(plain._id);
    }
    return plain;
}

const router = Router();

// ---------------------------------------------------------------------------
// ROLES
// ---------------------------------------------------------------------------

// GET /iam/roles
router.get('/iam/roles', async (req: Request, res: Response) => {
    try {
        await ensureSeeded();
        const page = parseInt((req.query.page as string) || '1', 10);
        const limit = parseInt((req.query.limit as string) || '50', 10);
        const search = (req.query.search as string) || '';
        const filter: any = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        const [items, total] = await Promise.all([
            IamRole.find(filter)
                .sort({ isSystem: -1, name: 1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            IamRole.countDocuments(filter),
        ]);
        res.json({
            success: true,
            data: items.map((d) => normalizeDoc(d)),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /iam/roles/:id
router.get('/iam/roles/:id', async (req: Request, res: Response) => {
    try {
        const role = await IamRole.findById(req.params.id).lean();
        if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
        res.json({ success: true, data: normalizeDoc(role) });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /iam/roles
router.post('/iam/roles', async (req: Request, res: Response) => {
    try {
        const { name, description, permissions } = req.body || {};
        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return res
                .status(400)
                .json({ success: false, message: 'Role name must be at least 2 characters' });
        }
        const existing = await IamRole.findOne({ name: name.trim() });
        if (existing) {
            return res
                .status(409)
                .json({ success: false, message: 'A role with this name already exists' });
        }
        const role = await IamRole.create({
            name: name.trim(),
            description: description?.trim() || '',
            permissions: Array.isArray(permissions) ? permissions : [],
            isSystem: false,
        });
        res.status(201).json({ success: true, data: normalizeDoc(role.toObject()) });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /iam/roles/:id
router.put('/iam/roles/:id', async (req: Request, res: Response) => {
    try {
        const { name, description, permissions } = req.body || {};
        const role = await IamRole.findById(req.params.id);
        if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
        if (role.isSystem && name && name !== role.name) {
            return res
                .status(400)
                .json({ success: false, message: 'Cannot rename a system role' });
        }
        if (name) role.name = name.trim();
        if (description !== undefined) role.description = description?.trim() || '';
        if (Array.isArray(permissions)) role.permissions = permissions;
        await role.save();
        res.json({ success: true, data: normalizeDoc(role.toObject()) });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /iam/roles/:id
router.delete('/iam/roles/:id', async (req: Request, res: Response) => {
    try {
        const role = await IamRole.findById(req.params.id);
        if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
        if (role.isSystem) {
            return res
                .status(400)
                .json({ success: false, message: 'Cannot delete a system role' });
        }
        await IamRole.deleteOne({ _id: req.params.id });
        res.json({ success: true, message: 'Role deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ---------------------------------------------------------------------------
// PERMISSIONS
// ---------------------------------------------------------------------------

// GET /iam/permissions
router.get('/iam/permissions', async (req: Request, res: Response) => {
    try {
        await ensureSeeded();
        const page = parseInt((req.query.page as string) || '1', 10);
        const limit = parseInt((req.query.limit as string) || '50', 10);
        const search = (req.query.search as string) || '';
        const moduleFilter = (req.query.module as string) || '';
        const filter: any = {};
        if (moduleFilter) filter.module = moduleFilter;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { module: { $regex: search, $options: 'i' } },
                { action: { $regex: search, $options: 'i' } },
            ];
        }
        const [items, total] = await Promise.all([
            IamPermission.find(filter)
                .sort({ module: 1, action: 1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            IamPermission.countDocuments(filter),
        ]);
        res.json({
            success: true,
            data: items.map((d) => normalizeDoc(d)),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /iam/permissions/:id
router.get('/iam/permissions/:id', async (req: Request, res: Response) => {
    try {
        const perm = await IamPermission.findById(req.params.id).lean();
        if (!perm)
            return res.status(404).json({ success: false, message: 'Permission not found' });
        res.json({ success: true, data: normalizeDoc(perm) });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /iam/permissions
router.post('/iam/permissions', async (req: Request, res: Response) => {
    try {
        const { name, description, module: mod, action } = req.body || {};
        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return res
                .status(400)
                .json({ success: false, message: 'Permission name must be at least 2 characters' });
        }
        if (!mod) return res.status(400).json({ success: false, message: 'Module is required' });
        if (!action)
            return res.status(400).json({ success: false, message: 'Action is required' });

        const existing = await IamPermission.findOne({ name: name.trim() });
        if (existing) {
            return res
                .status(409)
                .json({ success: false, message: 'A permission with this name already exists' });
        }
        const perm = await IamPermission.create({
            name: name.trim(),
            description: description?.trim() || '',
            module: String(mod).trim(),
            action: String(action).trim(),
            isSystem: false,
        });
        res.status(201).json({ success: true, data: normalizeDoc(perm.toObject()) });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /iam/permissions/:id
router.put('/iam/permissions/:id', async (req: Request, res: Response) => {
    try {
        const { name, description, module: mod, action } = req.body || {};
        const perm = await IamPermission.findById(req.params.id);
        if (!perm)
            return res.status(404).json({ success: false, message: 'Permission not found' });
        if (perm.isSystem && name && name !== perm.name) {
            return res
                .status(400)
                .json({ success: false, message: 'Cannot rename a system permission' });
        }
        if (name) perm.name = name.trim();
        if (description !== undefined) perm.description = description?.trim() || '';
        if (mod) perm.module = String(mod).trim();
        if (action) perm.action = String(action).trim();
        await perm.save();
        res.json({ success: true, data: normalizeDoc(perm.toObject()) });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /iam/permissions/:id
router.delete('/iam/permissions/:id', async (req: Request, res: Response) => {
    try {
        const perm = await IamPermission.findById(req.params.id);
        if (!perm)
            return res.status(404).json({ success: false, message: 'Permission not found' });
        if (perm.isSystem) {
            return res
                .status(400)
                .json({ success: false, message: 'Cannot delete a system permission' });
        }
        await IamPermission.deleteOne({ _id: req.params.id });
        res.json({ success: true, message: 'Permission deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
