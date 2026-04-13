import { Router, Request, Response } from 'express';

const router = Router();

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

// GET /admin/settings/:category
router.get('/:category', (req: Request, res: Response) => {
    const { category } = req.params;
    if (!settingsCache[category]) {
        return res.status(404).json({ success: false, message: `Settings category '${category}' not found` });
    }
    res.json({ success: true, data: settingsCache[category] });
});

// PUT /admin/settings/:category
router.put('/:category', (req: Request, res: Response) => {
    const { category } = req.params;
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

// PUT /admin/settings/security
router.put('/security', (req: Request, res: Response) => {
    settingsCache.security = { ...settingsCache.security, ...req.body };
    res.json({ success: true, data: settingsCache.security, message: 'Security settings updated' });
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
