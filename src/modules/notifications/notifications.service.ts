import { BaseService } from '../../shared/base/base.service';
import { NotificationModel, INotificationDocument } from './notifications.model';

export class NotificationService extends BaseService<INotificationDocument> {
    constructor() {
        super(NotificationModel);
    }

    /**
     * Send (create) a notification
     */
    async sendNotification(notificationData: any): Promise<INotificationDocument> {
        return await NotificationModel.create({
            ...notificationData,
            status: 'pending',
        });
    }

    /**
     * Send bulk notifications
     */
    async sendBulkNotifications(notifications: any[]): Promise<INotificationDocument[]> {
        const docs = notifications.map((n) => ({
            ...n,
            status: 'pending',
        }));
        return await NotificationModel.insertMany(docs, { ordered: false });
    }

    /**
     * Get user's notifications (for the notification bell)
     */
    async getUserNotifications(
        userId: string,
        limit: number = 50,
        offset: number = 0
    ): Promise<INotificationDocument[]> {
        return await NotificationModel.find({
            userId,
            type: 'in_app',
        })
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .lean();
    }

    /**
     * Get unread notification count
     */
    async getUnreadCount(userId: string): Promise<number> {
        return await NotificationModel.countDocuments({
            userId,
            type: 'in_app',
            status: { $in: ['pending', 'sent'] },
        });
    }

    /**
     * Mark a single notification as read
     */
    async markAsRead(notificationId: string): Promise<INotificationDocument | null> {
        return await NotificationModel.findByIdAndUpdate(
            notificationId,
            { $set: { status: 'read', readAt: new Date() } },
            { new: true }
        );
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string): Promise<number> {
        const result = await NotificationModel.updateMany(
            { userId, status: { $in: ['pending', 'sent'] } },
            { $set: { status: 'read', readAt: new Date() } }
        );
        return result.modifiedCount;
    }

    /**
     * Delete a notification
     */
    async deleteNotification(notificationId: string): Promise<boolean> {
        const result = await NotificationModel.deleteOne({ _id: notificationId });
        return result.deletedCount > 0;
    }
}
