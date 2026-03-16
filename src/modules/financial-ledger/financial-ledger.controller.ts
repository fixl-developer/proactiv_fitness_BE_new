import { Router, Request, Response } from 'express';
import { FinancialLedgerService } from './financial-ledger.service';
import { authenticate, authorize } from '@modules/iam/auth.middleware';

const router = Router();
const ledgerService = new FinancialLedgerService();

// Create ledger entry
router.post('/entry', authenticate, authorize(['admin', 'finance']), async (req: Request, res: Response) => {
    try {
        const { transactionId, type, amount, category, description, relatedEntity, metadata } = req.body;
        const tenantId = req.user?.tenantId;

        const entry = await ledgerService.createEntry({
            tenantId,
            transactionId,
            type,
            amount,
            category,
            description,
            relatedEntity,
            metadata,
        });

        res.json({ success: true, data: entry });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get ledger entries
router.get('/entries', authenticate, async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;
        const { limit = 50, offset = 0, category, type } = req.query;

        const entries = await ledgerService.getEntries(tenantId, {
            limit: Number(limit),
            offset: Number(offset),
            category: category as string,
            type: type as string,
        });

        res.json({ success: true, data: entries });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get balance
router.get('/balance', authenticate, async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;

        const balance = await ledgerService.getBalance(tenantId);

        res.json({ success: true, data: balance });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router;
