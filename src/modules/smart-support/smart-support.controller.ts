import { Router, Request, Response } from 'express';
import { SmartSupportService } from './smart-support.service';
import { authenticate } from '@modules/iam/auth.middleware';

const router = Router();
const smartSupportService = new SmartSupportService();

// Classify ticket
router.post('/classify-ticket', authenticate, async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;
        const { ticketRef, subject, message, memberHistory } = req.body;

        const result = await smartSupportService.classifyTicket({
            tenantId,
            ticketRef,
            subject,
            message,
            memberHistory,
        });

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Route ticket
router.post('/route-ticket', authenticate, async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;
        const { ticketRef, category, priority, subject, message, availableAgents } = req.body;

        const result = await smartSupportService.routeTicket({
            tenantId,
            ticketRef,
            category,
            priority,
            subject,
            message,
            availableAgents,
        });

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Suggest response
router.get('/suggest-response/:ticketId', authenticate, async (req: Request, res: Response) => {
    try {
        const { ticketId } = req.params;

        const result = await smartSupportService.suggestResponse(ticketId);

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Analyze sentiment
router.post('/analyze-sentiment', authenticate, async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;
        const { ticketRef, message } = req.body;

        const result = await smartSupportService.analyzeSentiment({
            tenantId,
            ticketRef,
            message,
        });

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Auto-resolve ticket
router.post('/auto-resolve', authenticate, async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;
        const { ticketRef, subject, message, category } = req.body;

        const result = await smartSupportService.autoResolve({
            tenantId,
            ticketRef,
            subject,
            message,
            category,
        });

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router;
