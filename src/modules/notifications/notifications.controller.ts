import { Router, Request, Response } from 'express';
import { NotificationService } from './notifications.service';
import { authenticate } from '@modules/iam/auth.middleware';

const router = Router();
const notificationService = new NotificationService();

// Send notification
router.post('/send', authenticate, async (req: Request, res: Response) => {
    try {
        const { userId, type, category, title, message, recipient, metadata } = req.body;
        const tenantId = req.user?.tenantId;

        const notification = await notificationService.sendNotification({
            userId,
            tenantId,
            type,
            category,
            title,
            message,
            recipient,
            metadata,
        });

        res.json({ success: true, data: notification });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Send bulk notifications
router.post('/send-bulk', authenticate, async (req: Request, res: Response) => {
    try {
        const { notifications } = req.body;
        const tenantId = req.user?.tenantId;

        const results = await notificationService.sendBulkNotifications(
            notifications.map((n: any) => ({ ...n, tenantId }))
        );

        res.json({ success: true, data: results });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get user notifications
router.get('/user', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { limit = 20, offset = 0 } = req.query;

        const notifications = await notificationService.getUserNotifications(userId, Number(limit), Number(offset));

        res.json({ success: true, data: notifications });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Mark as read
router.put('/:notificationId/read', authenticate, async (req: Request, res: Response) => {
    try {
        const { notificationId } = req.params;

        const notification = await notificationService.markAsRead(notificationId);

        res.json({ success: true, data: notification });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Delete notification
router.delete('/:notificationId', authenticate, async (req: Request, res: Response) => {
    try {
        const { notificationId } = req.params;

        await notificationService.deleteNotification(notificationId);

        res.json({ success: true });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router;
