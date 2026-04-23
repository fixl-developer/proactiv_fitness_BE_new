import { Router, Request, Response } from 'express';
import { PaymentService } from './payments.service';
import { authenticate, authorize } from '@modules/iam/auth.middleware';

const router = Router();
const paymentService = new PaymentService();

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
