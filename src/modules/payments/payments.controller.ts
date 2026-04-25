import { Router, Request, Response } from 'express';
import { PaymentService } from './payments.service';
import { PaymentModel } from './payments.model';
import { authenticate, authorize } from '@modules/iam/auth.middleware';

const router = Router();
const paymentService = new PaymentService();

// =============================================
// ADMIN CRUD (frontend admin/finance/payments page)
// GET /payments?page=&limit=&search=
// POST /payments               (create plain record)
// PUT /payments/:id            (update by _id)
// DELETE /payments/:id         (delete by _id)
// =============================================

// List payments with pagination + search
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
        const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '10', 10)));
        const search = ((req.query.search as string) || '').trim();

        const filter: any = {};
        if (search) {
            filter.$or = [
                { transactionId: { $regex: search, $options: 'i' } },
                { userId: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const [docs, total] = await Promise.all([
            PaymentModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            PaymentModel.countDocuments(filter),
        ]);

        const data = docs.map((d: any) => ({
            id: String(d._id),
            transactionId: d.transactionId,
            amount: d.amount,
            currency: d.currency,
            paymentMethod: d.paymentMethod,
            gateway: d.gateway,
            status: d.status,
            description: d.description,
            customerId: d.userId,
            metadata: d.metadata,
            createdAt: d.createdAt,
        }));

        res.json({
            success: true,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create plain payment record (admin manual entry)
router.post('/', authenticate, async (req: Request, res: Response) => {
    try {
        const { transactionId, amount, currency, paymentMethod, gateway, status, description, customerId, metadata } = req.body;
        if (!transactionId || amount === undefined || !paymentMethod || !gateway || !customerId) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }
        const doc = await PaymentModel.create({
            transactionId,
            userId: customerId,
            tenantId: req.user?.tenantId || 'default',
            amount,
            currency: currency || 'USD',
            paymentMethod,
            gateway,
            status: status || 'pending',
            description: description || '',
            metadata: metadata || {},
        });
        return res.json({
            success: true,
            data: {
                id: String(doc._id),
                transactionId: doc.transactionId,
                amount: doc.amount,
                currency: doc.currency,
                paymentMethod: doc.paymentMethod,
                gateway: doc.gateway,
                status: doc.status,
                description: doc.description,
                customerId: doc.userId,
                metadata: doc.metadata,
                createdAt: doc.createdAt,
            },
        });
    } catch (error: any) {
        return res.status(400).json({ success: false, error: error.message });
    }
});

// Process payment
router.post('/process', authenticate, async (req: Request, res: Response) => {
    try {
        const { amount, currency, paymentMethod, gateway, description, metadata } = req.body;
        const userId = req.user?.id;
        const tenantId = req.user?.tenantId;

        const transaction = await paymentService.processPayment({
            userId,
            tenantId,
            amount,
            currency,
            paymentMethod,
            gateway,
            description,
            metadata,
        });

        res.json({ success: true, data: transaction });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Refund payment
router.post('/refund/:transactionId', authenticate, async (req: Request, res: Response) => {
    try {
        const { transactionId } = req.params;
        const { amount } = req.body;

        const refund = await paymentService.refundPayment(transactionId, amount);

        res.json({ success: true, data: refund });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Payment stats (must be before /:transactionId to avoid being caught by it)
router.get('/stats', async (_req: Request, res: Response) => {
    try {
        const { Booking } = require('../booking/booking.model');
        const [totalAgg, pendingCount, completedCount] = await Promise.all([
            Booking.aggregate([
                { $match: { 'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] } } },
                { $group: { _id: null, total: { $sum: '$payment.amount' }, count: { $sum: 1 } } },
            ]),
            Booking.countDocuments({ 'payment.status': { $in: ['pending', 'PENDING'] } }),
            Booking.countDocuments({ 'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] } }),
        ]);
        res.json({
            success: true,
            data: {
                totalPayments: (totalAgg[0]?.count || 0) + pendingCount,
                totalAmount: totalAgg[0]?.total || 0,
                pendingPayments: pendingCount,
                completedPayments: completedCount,
            },
        });
    } catch {
        res.json({ success: true, data: { totalPayments: 0, totalAmount: 0, pendingPayments: 0, completedPayments: 0 } });
    }
});

// Update payment by _id (admin)
router.put('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const updates: any = {};
        const allowed = ['transactionId', 'amount', 'currency', 'paymentMethod', 'gateway', 'status', 'description', 'metadata'];
        for (const k of allowed) {
            if (req.body[k] !== undefined) updates[k] = req.body[k];
        }
        if (req.body.customerId !== undefined) updates.userId = req.body.customerId;

        const doc = await PaymentModel.findByIdAndUpdate(req.params.id, updates, { new: true }).lean();
        if (!doc) return res.status(404).json({ success: false, error: 'Payment not found' });

        return res.json({
            success: true,
            data: {
                id: String((doc as any)._id),
                transactionId: (doc as any).transactionId,
                amount: (doc as any).amount,
                currency: (doc as any).currency,
                paymentMethod: (doc as any).paymentMethod,
                gateway: (doc as any).gateway,
                status: (doc as any).status,
                description: (doc as any).description,
                customerId: (doc as any).userId,
                metadata: (doc as any).metadata,
                createdAt: (doc as any).createdAt,
            },
        });
    } catch (error: any) {
        return res.status(400).json({ success: false, error: error.message });
    }
});

// Delete payment by _id (admin)
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const doc = await PaymentModel.findByIdAndDelete(req.params.id).lean();
        if (!doc) return res.status(404).json({ success: false, error: 'Payment not found' });
        return res.json({ success: true, data: { id: String((doc as any)._id) } });
    } catch (error: any) {
        return res.status(400).json({ success: false, error: error.message });
    }
});

// Get transaction
router.get('/:transactionId', authenticate, async (req: Request, res: Response) => {
    try {
        const { transactionId } = req.params;

        const transaction = await paymentService.getTransaction(transactionId);

        res.json({ success: true, data: transaction });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get user transactions
router.get('/user/transactions', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { limit = 10, offset = 0 } = req.query;

        const transactions = await paymentService.getUserTransactions(userId, Number(limit), Number(offset));

        res.json({ success: true, data: transactions });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Webhook for payment gateway
router.post('/webhook/:gateway', async (req: Request, res: Response) => {
    try {
        const { gateway } = req.params;
        const event = req.body;

        await paymentService.handleWebhook(gateway, event);

        res.json({ success: true });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router;
