import { Router, Request, Response } from 'express';
import { BillingModel } from './billing.model';
import { authenticate } from '@modules/iam/auth.middleware';

const router = Router();

// List all billings
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const { limit = 50, offset = 0, status } = req.query;
        const filter: any = {};
        if (status && status !== 'All') filter.status = (status as string).toLowerCase();

        const billings = await BillingModel.find(filter)
            .sort({ createdAt: -1 })
            .skip(Number(offset))
            .limit(Number(limit))
            .lean();

        res.json({ success: true, data: billings });
    } catch (error: any) {
        res.json({ success: true, data: [] });
    }
});

// Create billing
router.post('/', authenticate, async (req: Request, res: Response) => {
    try {
        const billing = await BillingModel.create({
            billingId: `INV-${Date.now().toString(36).toUpperCase()}`,
            userId: req.body.userId || req.user?.id || 'system',
            tenantId: req.user?.tenantId || 'default',
            amount: req.body.amount || 0,
            currency: req.body.currency || 'USD',
            billingPeriod: req.body.billingPeriod || 'monthly',
            status: 'draft',
            dueDate: req.body.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            items: req.body.items || [{ description: req.body.description || 'Invoice', quantity: 1, unitPrice: req.body.amount || 0, total: req.body.amount || 0 }],
            notes: req.body.notes || '',
        });
        res.json({ success: true, data: billing });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get single billing
router.get('/:billingId', authenticate, async (req: Request, res: Response) => {
    try {
        const billing = await BillingModel.findOne({ $or: [{ billingId: req.params.billingId }, { _id: req.params.billingId }] });
        if (!billing) return res.status(404).json({ success: false, error: 'Billing not found' });
        res.json({ success: true, data: billing });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Update billing status
router.patch('/:billingId/status', authenticate, async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const updates: any = { status: status?.toLowerCase() || 'paid' };
        if (updates.status === 'paid') updates.paidDate = new Date();

        const billing = await BillingModel.findOneAndUpdate(
            { $or: [{ billingId: req.params.billingId }, { _id: req.params.billingId }] },
            updates,
            { new: true }
        );
        if (!billing) return res.status(404).json({ success: false, error: 'Billing not found' });
        res.json({ success: true, data: billing });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Mark as paid (legacy)
router.put('/:billingId/mark-paid', authenticate, async (req: Request, res: Response) => {
    try {
        const billing = await BillingModel.findOneAndUpdate(
            { $or: [{ billingId: req.params.billingId }, { _id: req.params.billingId }] },
            { status: 'paid', paidDate: new Date() },
            { new: true }
        );
        if (!billing) return res.status(404).json({ success: false, error: 'Billing not found' });
        res.json({ success: true, data: billing });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router;
