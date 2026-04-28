import { NotificationModel } from '../notifications/notifications.model';
import { User } from '../iam/user.model';
import { UserRole } from '@shared/enums';
import { EntityContext } from './realtime.interface';
import { isUserOnline } from './socket.rooms';
import logger from '@shared/utils/logger.util';

// Actions that are worth persisting as notifications (skip noisy updates)
const PERSISTABLE_ACTIONS = ['created', 'deleted', 'cancelled'];

// Entity-to-category mapping for notification records
const ENTITY_CATEGORY_MAP: Record<string, string> = {
    booking: 'booking',
    attendance: 'alert',
    program: 'announcement',
    schedule: 'alert',
    payment: 'payment',
    ticket: 'alert',
    staff: 'announcement',
    achievement: 'announcement',
    location: 'announcement',
    feedback: 'alert',
};

/**
 * Persist in-app notifications for users affected by an event.
 * Only persists for 'created', 'deleted', 'cancelled' actions to avoid notification overload.
 * Online users still get the socket event; this ensures offline users see it later.
 */
export async function persistNotification(
    entity: string,
    action: string,
    data: Record<string, any>,
    context: EntityContext,
    title: string,
    message: string
): Promise<void> {
    // Only persist meaningful actions
    if (!PERSISTABLE_ACTIONS.includes(action)) return;

    try {
        const targetUserIds = await resolveTargetUsers(entity, context);

        if (targetUserIds.length === 0) return;

        // Filter out the actor (don't notify yourself)
        const filteredUserIds = targetUserIds.filter((id) => id !== context.userId);

        if (filteredUserIds.length === 0) return;

        const category = ENTITY_CATEGORY_MAP[entity] || 'alert';
        const entityId = data._id?.toString() || data.id?.toString() || '';
        const eventType = `${entity}:${action}`;

        // Batch-create notifications
        const notifications = filteredUserIds.map((userId) => ({
            userId,
            tenantId: context.tenantId || 'default',
            type: 'in_app' as const,
            category,
            title,
            message,
            status: 'pending' as const,
            recipient: userId,
            eventType,
            entityId,
            entityType: entity,
            metadata: {
                entity,
                action,
                entityId,
                actorId: context.userId,
                locationId: context.locationId,
                organizationId: context.organizationId,
            },
        }));

        await NotificationModel.insertMany(notifications, { ordered: false });

        logger.info(`[Notification] Persisted ${notifications.length} notifications for ${eventType}`);
    } catch (error: any) {
        logger.warn(`[Notification] Persistence failed: ${error.message}`);
    }
}

/**
 * Resolve which individual user IDs should receive a persistent notification
 * based on the entity context (location, organization, role, etc.)
 */
async function resolveTargetUsers(
    entity: string,
    context: EntityContext
): Promise<string[]> {
    const userIds: Set<string> = new Set();

    // Direct target user always gets notified
    if (context.targetUserId) {
        userIds.add(context.targetUserId);
    }

    // For support entities, notify the ticket creator + support staff
    const SUPPORT_ENTITIES = ['ticket', 'inquiry', 'escalation'];
    if (SUPPORT_ENTITIES.includes(entity)) {
        const supportStaff = await User.find(
            { role: UserRole.SUPPORT_STAFF, status: 'ACTIVE', isDeleted: { $ne: true } },
            { _id: 1 }
        ).lean();
        supportStaff.forEach((u) => userIds.add(u._id.toString()));
    }

    // Location-scoped: notify location managers and coaches at that location
    if (context.locationId) {
        const locationUsers = await User.find(
            {
                locationId: context.locationId,
                role: { $in: [UserRole.LOCATION_MANAGER, UserRole.COACH] },
                status: 'ACTIVE',
                isDeleted: { $ne: true },
            },
            { _id: 1 }
        ).lean();
        locationUsers.forEach((u) => userIds.add(u._id.toString()));
    }

    // Organization-scoped: notify franchise owners and regional admins
    if (context.organizationId) {
        const orgUsers = await User.find(
            {
                organizationId: context.organizationId,
                role: { $in: [UserRole.FRANCHISE_OWNER, UserRole.REGIONAL_ADMIN] },
                status: 'ACTIVE',
                isDeleted: { $ne: true },
            },
            { _id: 1 }
        ).lean();
        orgUsers.forEach((u) => userIds.add(u._id.toString()));
    }

    // Always notify admins (limit to first 10 to avoid excessive notifications)
    const admins = await User.find(
        { role: UserRole.ADMIN, status: 'ACTIVE', isDeleted: { $ne: true } },
        { _id: 1 }
    )
        .limit(10)
        .lean();
    admins.forEach((u) => userIds.add(u._id.toString()));

    return Array.from(userIds);
}

/**
 * Get pending (undelivered) notifications for a user
 */
export async function getPendingNotifications(userId: string): Promise<any[]> {
    return NotificationModel.find({
        userId,
        type: 'in_app',
        status: { $in: ['pending', 'sent'] },
    })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
}

/**
 * Mark notifications as sent (delivered via socket)
 */
export async function markNotificationsAsSent(notificationIds: string[]): Promise<void> {
    if (notificationIds.length === 0) return;
    await NotificationModel.updateMany(
        { _id: { $in: notificationIds } },
        { $set: { status: 'sent', sentAt: new Date() } }
    );
}
