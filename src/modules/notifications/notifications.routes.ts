import { Router, Request, Response } from 'express';
import { authenticate } from '../iam/auth.middleware';

const router = Router();

// In-memory notification storage
const notificationsStore: any[] = [];

/**
 * @route   GET /notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const userNotifications = notificationsStore.filter(n => n.userId === userId);
        res.json({ success: true, data: userNotifications });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /notifications/unread
 * @desc    Get unread notifications count
 * @access  Private
 */
router.get('/unread', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const unreadCount = notificationsStore.filter(
            n => n.userId === userId && !n.read
        ).length;

        res.json({ success: true, data: { unreadCount } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   PUT /notifications/:notificationId/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:notificationId/read', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { notificationId } = req.params;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const notification = notificationsStore.find(
            n => n.id === notificationId && n.userId === userId
        );

        if (!notification) {
            res.status(404).json({ success: false, message: 'Notification not found' });
            return;
        }

        notification.read = true;
        notification.readAt = new Date();

        res.json({ success: true, data: notification, message: 'Notification marked as read' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   PUT /notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/read-all', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const userNotifications = notificationsStore.filter(n => n.userId === userId);
        userNotifications.forEach(n => {
            n.read = true;
            n.readAt = new Date();
        });

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   DELETE /notifications/:notificationId
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:notificationId', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { notificationId } = req.params;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const index = notificationsStore.findIndex(
            n => n.id === notificationId && n.userId === userId
        );

        if (index === -1) {
            res.status(404).json({ success: false, message: 'Notification not found' });
            return;
        }

        notificationsStore.splice(index, 1);
        res.json({ success: true, message: 'Notification deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
