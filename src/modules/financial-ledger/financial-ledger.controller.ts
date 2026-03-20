import { Router, Request, Response } from 'express';
import { FinancialLedgerModel } from './financial-ledger.model';
import { authenticate } from '@modules/iam/auth.middleware';

const router = Router();

// Create ledger entry
router.post('/entry', authenticate, async (req: Request, res: Response) => {
    try {
        const entry = await FinancialLedgerModel.create({
            entryId: `TXN-${Date.now().toString(36).toUpperCase()}`,
            tenantId: req.user?.tenantId || 'default',
            transactionId: req.body.transactionId || `TR-${Date.now()}`,
            type: req.body.type || 'debit',
            amount: req.body.amount || 0,
            currency: req.body.currency || 'USD',
            category: req.body.category || 'payment',
            description: req.body.description || '',
            relatedEntity: req.body.relatedEntity || {},
            metadata: req.body.metadata || {},
        });
        res.json({ success: true, data: entry });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get ledger entries
router.get('/entries', authenticate, async (req: Request, res: Response) => {
    try {
        const { limit = 50, offset = 0, category, type, startDate, endDate } = req.query;
        const filter: any = {};
        if (category && category !== 'All') filter.category = category;
        if (type) filter.type = type;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate as string);
            if (endDate) filter.createdAt.$lte = new Date(endDate as string);
        }

        const entries = await FinancialLedgerModel.find(filter)
            .sort({ createdAt: -1 })
            .skip(Number(offset))
            .limit(Number(limit))
            .lean();

        res.json({ success: true, data: entries });
    } catch (error: any) {
        res.json({ success: true, data: [] });
    }
});

// Get balance
router.get('/balance', authenticate, async (req: Request, res: Response) => {
    try {
        const [creditAgg, debitAgg] = await Promise.all([
            FinancialLedgerModel.aggregate([
                { $match: { type: 'credit' } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            FinancialLedgerModel.aggregate([
                { $match: { type: 'debit' } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
        ]);
        const totalCredit = creditAgg[0]?.total || 0;
        const totalDebit = debitAgg[0]?.total || 0;
        res.json({
            success: true,
            data: { totalCredit, totalDebit, balance: totalCredit - totalDebit },
        });
    } catch (error: any) {
        res.json({ success: true, data: { totalCredit: 0, totalDebit: 0, balance: 0 } });
    }
});

export default router;
