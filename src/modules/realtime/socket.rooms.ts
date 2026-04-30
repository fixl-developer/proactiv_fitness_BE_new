import { Socket } from 'socket.io';
import { UserRole } from '@shared/enums';
import { SocketUser } from './realtime.interface';
import logger from '@shared/utils/logger.util';

// Track online users: userId → Set of socketIds
const onlineUsers = new Map<string, Set<string>>();

/**
 * Assign a socket to rooms based on the user's role and entity assignments
 */
export function assignRooms(socket: Socket): string[] {
    const user: SocketUser = socket.data.user;
    if (!user) return [];

    const rooms: string[] = [];

    // 1. Personal room — every user gets one
    rooms.push(`user:${user.id}`);

    // 2. Role-based room
    rooms.push(`role:${user.role}`);

    // 3. Entity-based rooms depending on role
    switch (user.role) {
        case UserRole.ADMIN:
            // Admin sees everything — no additional rooms needed (role:ADMIN catches all)
            break;

        case UserRole.REGIONAL_ADMIN:
            if (user.organizationId) rooms.push(`organization:${user.organizationId}`);
            break;

        case UserRole.FRANCHISE_OWNER:
            if (user.organizationId) rooms.push(`organization:${user.organizationId}`);
            break;

        case UserRole.LOCATION_MANAGER:
            if (user.locationId) rooms.push(`location:${user.locationId}`);
            if (user.organizationId) rooms.push(`organization:${user.organizationId}`);
            break;

        case UserRole.COACH:
            if (user.locationId) rooms.push(`location:${user.locationId}`);
            break;

        case UserRole.PARTNER_ADMIN:
            if (user.organizationId) rooms.push(`organization:${user.organizationId}`);
            break;

        case UserRole.SUPPORT_STAFF:
            // Gets events via role:SUPPORT_STAFF room
            break;

        case UserRole.PARENT:
        case UserRole.USER:
            if (user.locationId) rooms.push(`location:${user.locationId}`);
            break;

        default:
            break;
    }

    // Join all rooms
    for (const room of rooms) {
        socket.join(room);
    }

    // Track online status
    if (!onlineUsers.has(user.id)) {
        onlineUsers.set(user.id, new Set());
    }
    onlineUsers.get(user.id)!.add(socket.id);

    logger.info(`[Socket] User ${user.email} (${user.role}) joined rooms: [${rooms.join(', ')}]`);

    return rooms;
}

/**
 * Clean up when a socket disconnects
 */
export function handleDisconnect(socket: Socket): void {
    const user: SocketUser = socket.data.user;
    if (!user) return;

    const userSockets = onlineUsers.get(user.id);
    if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
            onlineUsers.delete(user.id);
        }
    }

    logger.info(`[Socket] User ${user.email} disconnected`);
}

/**
 * Check if a user is currently online (has at least one active socket)
 */
export function isUserOnline(userId: string): boolean {
    const sockets = onlineUsers.get(userId);
    return !!sockets && sockets.size > 0;
}

/**
 * Get count of online users
 */
export function getOnlineUserCount(): number {
    return onlineUsers.size;
}

/**
 * Get all online user IDs
 */
export function getOnlineUserIds(): string[] {
    return Array.from(onlineUsers.keys());
}
