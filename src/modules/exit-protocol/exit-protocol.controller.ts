import { Router, Request, Response } from 'express';
import { ExitProtocolService } from './exit-protocol.service';
import { authenticate, authorize } from '@/middleware/auth';

const router = Router();
const exitProtocolService = new ExitProtocolService();

// Initiate exit
router.post('/initiate', authenticate, async (req: Request, res: Response) => {
    try {
        const { reason, requestedDate } = req.body;
        const userId = req.user?.id;
        const tenantId = req.user?.tenantId;

        const exitRequest = await exitProtocolService.initiateExit({
            userId,
            tenantId,
            reason,
            requestedDate,
        });

        res.json({ success: true, data: exitRequest });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Approve exit
router.post('/:exitId/approve', authenticate, authorize(['admin', 'super_admin']), async (req: Request, res: Response) => {
    try {
        const { exitId } = req.params;
        const approvedBy = req.user?.id;

        const exitRequest = await exitProtocolService.approveExit(exitId, approvedBy);

        res.json({ success: true, data: exitRequest });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Complete exit
router.post('/:exitId/complete', authenticate, authorize(['admin', 'super_admin']), async (req: Request, res: Response) => {
    try {
        const { exitId } = req.params;

        const exitRequest = await exitProtocolService.completeExit(exitId);

        res.json({ success: true, data: exitRequest });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get exit requests
router.get('/list', authenticate, authorize(['admin', 'super_admin']), async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;

        const requests = await exitProtocolService.getExitRequests(tenantId);

        res.json({ success: true, data: requests });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Delete user data
router.post('/:userId/delete-data', authenticate, authorize(['admin', 'super_admin']), async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const tenantId = req.user?.tenantId;

        const result = await exitProtocolService.deleteUserData(userId, tenantId);

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router;
