import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import envConfig from '@config/env.config';
import logger from '@shared/utils/logger.util';
import { socketAuthMiddleware } from './socket.auth';
import { assignRooms, handleDisconnect } from './socket.rooms';
import { setIO } from './realtime.emitter';
import { getPendingNotifications, markNotificationsAsSent } from './notification.persister';
import { NotificationModel } from '../notifications/notifications.model';

/**
 * Initialize the Socket.io server, attach to the HTTP server,
 * set up authentication, room management, and event handlers.
 */
export function initializeSocketServer(httpServer: HttpServer): Server {
    const io = new Server(httpServer, {
        cors: {
            origin: envConfig.get().corsOrigin,
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
        transports: ['websocket', 'polling'],
    });

    // Register JWT authentication middleware
    io.use(socketAuthMiddleware);

    // Store the io instance globally for the emitter
    setIO(io);

    // Handle new connections
    io.on('connection', async (socket: Socket) => {
        const user = socket.data.user;
        logger.info(`[Socket] Connected: ${user.email} (${user.role}) — socket ${socket.id}`);

        // Assign rooms based on role and entity
        const rooms = assignRooms(socket);

        // Send connection confirmation to the client
        socket.emit('connected', {
            userId: user.id,
            role: user.role,
            rooms,
            timestamp: new Date().toISOString(),
        });

        // Deliver any pending notifications
        try {
            const pendingNotifications = await getPendingNotifications(user.id);
            if (pendingNotifications.length > 0) {
                socket.emit('notifications:pending', pendingNotifications);
                const notificationIds = pendingNotifications.map((n: any) => n._id.toString());
                await markNotificationsAsSent(notificationIds);
            }
        } catch (err: any) {
            logger.warn(`[Socket] Failed to deliver pending notifications: ${err.message}`);
        }

        // Client requests to sync notifications (e.g., after reconnect)
        socket.on('notifications:sync', async () => {
            try {
                const notifications = await getPendingNotifications(user.id);
                socket.emit('notifications:pending', notifications);
                if (notifications.length > 0) {
                    const ids = notifications.map((n: any) => n._id.toString());
                    await markNotificationsAsSent(ids);
                }
            } catch (err: any) {
                logger.warn(`[Socket] Notification sync failed: ${err.message}`);
            }
        });

        // Client marks a notification as read
        socket.on('notification:read', async (notificationId: string) => {
            try {
                await NotificationModel.updateOne(
                    { _id: notificationId, userId: user.id },
                    { $set: { status: 'read', readAt: new Date() } }
                );
            } catch (err: any) {
                logger.warn(`[Socket] Mark notification read failed: ${err.message}`);
            }
        });

        // Client marks all notifications as read
        socket.on('notifications:read-all', async () => {
            try {
                await NotificationModel.updateMany(
                    { userId: user.id, status: { $in: ['pending', 'sent'] } },
                    { $set: { status: 'read', readAt: new Date() } }
                );
            } catch (err: any) {
                logger.warn(`[Socket] Mark all notifications read failed: ${err.message}`);
            }
        });

        // Handle disconnect
        socket.on('disconnect', (reason) => {
            handleDisconnect(socket);
            logger.info(`[Socket] Disconnected: ${user.email} — reason: ${reason}`);
        });

        // Handle errors
        socket.on('error', (error) => {
            logger.error(`[Socket] Error for ${user.email}: ${error.message}`);
        });
    });

    logger.info(`[Socket] Socket.io server initialized`);

    return io;
}
