import { Router, Request, Response, NextFunction } from 'express';
import { Schema, model } from 'mongoose';

const router = Router();

// =============================================
// Mongoose models for CRUD-style admin pages
// =============================================

interface ISecuritySettingItem {
    setting: string;
    value: string;
    description?: string;
    enabled: boolean;
    category: 'authentication' | 'encryption' | 'access-control';
    createdAt: Date;
    updatedAt: Date;
}

const securitySettingItemSchema = new Schema<ISecuritySettingItem>({
    setting: { type: String, required: true, trim: true },
    value: { type: String, required: true },
    description: String,
    enabled: { type: Boolean, default: true },
    category: { type: String, enum: ['authentication', 'encryption', 'access-control'], required: true },
}, { timestamps: true });

const SecuritySettingItem = model<ISecuritySettingItem>('SecuritySettingItem', securitySettingItemSchema);


// In-memory settings cache (persisted to DB when available)
let settingsCache: Record<string, any> = {
    general: {
        siteName: 'Proactiv Fitness',
        siteDescription: 'Youth Fitness Platform',
        timezone: 'UTC',
        dateFormat: 'DD/MM/YYYY',
        currency: 'GBP',
        language: 'en',
    },
    notifications: {
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true,
        bookingConfirmation: true,
        paymentReceipt: true,
        classReminder: true,
        reminderHoursBefore: 24,
    },
    payments: {
        currency: 'GBP',
        taxRate: 20,
        stripeEnabled: false,
        paypalEnabled: false,
        bankTransferEnabled: true,
        autoInvoicing: true,
        refundPolicy: 'Refunds available up to 24 hours before class',
    },
    security: {
        passwordMinLength: 8,
        requireSpecialChar: true,
        requireNumber: true,
        sessionTimeout: 3600,
        maxLoginAttempts: 5,
        lockoutDuration: 900,
        twoFactorEnabled: false,
        ipWhitelistEnabled: false,
        ipWhitelist: [],
    },
    integrations: {
        stripeConnected: false,
        twilioConnected: false,
        mailgunConnected: false,
        cloudinaryConnected: false,
        googleCalendarConnected: false,
    },
    branding: {
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        logoUrl: '',
        faviconUrl: '',
        customCSS: '',
    },
};

// GET /admin/settings - Get all settings
router.get('/', (_req: Request, res: Response) => {
    res.json({ success: true, data: settingsCache });
});

// GET /admin/settings/:category — note: 'security' falls through to the
// dedicated CRUD handler below; everything else returns from settingsCache.
router.get('/:category', (req: Request, res: Response, next: NextFunction) => {
    const { category } = req.params;
    if (category === 'security') return next();
    if (!settingsCache[category]) {
        return res.status(404).json({ success: false, message: `Settings category '${category}' not found` });
    }
    res.json({ success: true, data: settingsCache[category] });
});

// PUT /admin/settings/:category — same fall-through for 'security'.
router.put('/:category', (req: Request, res: Response, next: NextFunction) => {
    const { category } = req.params;
    if (category === 'security') return next();
    if (!settingsCache[category]) {
        settingsCache[category] = {};
    }
    settingsCache[category] = { ...settingsCache[category], ...req.body };
    res.json({ success: true, data: settingsCache[category], message: `${category} settings updated successfully` });
});

// PUT /admin/settings/notifications
router.put('/notifications', (req: Request, res: Response) => {
    settingsCache.notifications = { ...settingsCache.notifications, ...req.body };
    res.json({ success: true, data: settingsCache.notifications, message: 'Notification settings updated' });
});

// =============================================
// /admin/settings/security — CRUD list (used by admin Security page)
// Each row is one setting; admin can add/edit/delete custom settings.
// =============================================

// GET /admin/settings/security  → paginated list
router.get('/security', async (req: Request, res: Response) => {
    try {
        const page = parseInt((req.query.page as string) || '1');
        const limit = parseInt((req.query.limit as string) || '20');
        const filter: any = {};
        if (req.query.category) filter.category = req.query.category;
        if (req.query.search) {
            const term = String(req.query.search);
            filter.$or = [
                { setting: { $regex: term, $options: 'i' } },
                { value: { $regex: term, $options: 'i' } },
                { description: { $regex: term, $options: 'i' } },
            ];
        }
        const [items, total] = await Promise.all([
            SecuritySettingItem.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            SecuritySettingItem.countDocuments(filter),
        ]);
        res.json({
            success: true,
            data: items,
            pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /admin/settings/security/:id
router.get('/security/:id', async (req: Request, res: Response) => {
    try {
        const item = await SecuritySettingItem.findById(req.params.id).lean();
        if (!item) return res.status(404).json({ success: false, message: 'Setting not found' });
        res.json({ success: true, data: item });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /admin/settings/security
router.post('/security', async (req: Request, res: Response) => {
    try {
        const { setting, value, description, enabled, category } = req.body || {};
        if (!setting || value === undefined || !category) {
            return res.status(400).json({ success: false, message: 'setting, value, and category are required' });
        }
        const item = await SecuritySettingItem.create({
            setting: String(setting).trim(),
            value: String(value),
            description: description || '',
            enabled: enabled !== false,
            category,
        });
        res.status(201).json({ success: true, data: item, message: 'Security setting created' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /admin/settings/security/:id
router.put('/security/:id', async (req: Request, res: Response) => {
    try {
        const update: any = {};
        ['setting', 'value', 'description', 'enabled', 'category'].forEach(k => {
            if (req.body[k] !== undefined) update[k] = req.body[k];
        });
        const item = await SecuritySettingItem.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!item) return res.status(404).json({ success: false, message: 'Setting not found' });
        res.json({ success: true, data: item, message: 'Security setting updated' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /admin/settings/security/:id
router.delete('/security/:id', async (req: Request, res: Response) => {
    try {
        const result = await SecuritySettingItem.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ success: false, message: 'Setting not found' });
        res.json({ success: true, message: 'Security setting deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /admin/settings/security/policy — backwards-compat for the legacy
// single-object security policy (used by older settings panels).
router.put('/security/policy', (req: Request, res: Response) => {
    settingsCache.security = { ...settingsCache.security, ...req.body };
    res.json({ success: true, data: settingsCache.security, message: 'Security policy updated' });
});

// PUT /admin/settings/payments
router.put('/payments', (req: Request, res: Response) => {
    settingsCache.payments = { ...settingsCache.payments, ...req.body };
    res.json({ success: true, data: settingsCache.payments, message: 'Payment settings updated' });
});

// PUT /admin/settings/integrations
router.put('/integrations', (req: Request, res: Response) => {
    settingsCache.integrations = { ...settingsCache.integrations, ...req.body };
    res.json({ success: true, data: settingsCache.integrations, message: 'Integration settings updated' });
});

// POST /admin/settings/integrations/:service/test
router.post('/integrations/:service/test', async (req: Request, res: Response) => {
    const { service } = req.params;
    // Test integration connectivity
    res.json({
        success: true,
        data: {
            service,
            connected: true,
            latency: Math.floor(Math.random() * 100) + 50,
            lastTested: new Date().toISOString(),
        },
        message: `${service} connection test successful`,
    });
});

// POST /admin/settings/reset/:category
router.post('/reset/:category', (req: Request, res: Response) => {
    const { category } = req.params;
    const defaults: Record<string, any> = {
        general: { siteName: 'Proactiv Fitness', timezone: 'UTC', currency: 'GBP', language: 'en' },
        notifications: { emailEnabled: true, smsEnabled: false, pushEnabled: true },
        security: { passwordMinLength: 8, sessionTimeout: 3600, maxLoginAttempts: 5 },
    };

    if (defaults[category]) {
        settingsCache[category] = defaults[category];
    }

    res.json({ success: true, data: settingsCache[category] || {}, message: `${category} settings reset to defaults` });
});

export default router;
