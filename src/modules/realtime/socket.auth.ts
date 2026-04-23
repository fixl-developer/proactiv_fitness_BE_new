import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import envConfig from '@config/env.config';
import { User } from '../iam/user.model';
import { SocketUser } from './realtime.interface';
import logger from '@shared/utils/logger.util';

/**
 * Socket.io authentication middleware
 * Verifies JWT token from handshake and attaches user data to socket
 */
export async function socketAuthMiddleware(
    socket: Socket,
    next: (err?: Error) => void
): Promise<void> {
    try {
        const token =
            socket.handshake.auth?.token ||
            socket.handshake.headers?.authorization?.replace('Bearer ', '');

        if (!token) {
            return next(new Error('Authentication token required'));
        }

        // Verify JWT
        const decoded = jwt.verify(token, envConfig.get().jwtSecret) as any;

        if (!decoded || !decoded.id) {
            return next(new Error('Invalid token'));
        }

        // Look up user in DB
        const user = await User.findOne({
            _id: decoded.id,
            status: 'ACTIVE',
            isDeleted: { $ne: true },
        }).lean();

        if (!user) {
            return next(new Error('User not found or inactive'));
        }

        // Attach user data to socket
        const socketUser: SocketUser = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            tenantId: (user as any).tenantId || 'default',
            organizationId: (user as any).organizationId,
            locationId: (user as any).locationId,
        };

        socket.data.user = socketUser;
        next();
    } catch (error: any) {
        logger.warn(`Socket auth failed: ${error.message}`);
        next(new Error('Authentication failed'));
    }
}
