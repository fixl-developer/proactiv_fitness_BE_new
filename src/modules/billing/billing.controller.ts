import { Router, Request, Response } from 'express';
import { BillingService } from './billing.service';
import { authenticate, authorize } from '@/middleware/auth';

const router = Router();
const billingService = new BillingService();

// Create billing
router.post('/create', authenticate, authorize(['admin', 'location_manager']), async (req: Request, res: Response) => {
    try {
        const { userId, amount, billingPeriod, items, dueDate } = req.body;
        const tenantId = req.user?.tenantId;

        const billing = await billingService.createBilling({
            userId,
            tenantId,
            amount,
            billingPeriod,
            items,
            dueDate,
        });

        res.json({ success: true, data: billing });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get billing
router.get('/:billingId', authenticate, async (req: Request, res: Response) => {
    try {
        const { billingId } = req.params;

        const billing = await billingService.getBilling(billingId);

        res.json({ success: true, data: billing });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get user billings
router.get('/user/list', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { limit = 10, offset = 0 } = req.query;

        const billings = await billingService.getUserBillings(userId, Number(limit), Number(offset));

        res.json({ success: true, data: billings });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Mark as paid
router.put('/:billingId/mark-paid', authenticate, async (req: Request, res: Response) => {
    try {
        const { billingId } = req.params;

        const billing = await billingService.markAsPaid(billingId);

        res.json({ success: true, data: billing });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router;
