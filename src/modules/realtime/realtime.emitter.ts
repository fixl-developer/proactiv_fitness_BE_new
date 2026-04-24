import { Server } from 'socket.io';
import { EntityContext, RealtimeEvent } from './realtime.interface';
import { persistNotification } from './notification.persister';
import logger from '@shared/utils/logger.util';

// Singleton Socket.io server reference
let ioInstance: Server | null = null;

/**
 * Set the Socket.io server instance (called once from socket.server.ts)
 */
export function setIO(io: Server): void {
    ioInstance = io;
}

/**
 * Get the Socket.io server instance
 */
export function getIO(): Server | null {
    return ioInstance;
}

// Support-related entity types that should notify SUPPORT_STAFF
const SUPPORT_ENTITIES = ['ticket', 'inquiry', 'escalation', 'support_request'];

/**
 * Resolve which Socket.io rooms should receive an event based on entity context
 */
function resolveTargetRooms(entity: string, action: string, context: EntityContext): string[] {
    const rooms: string[] = [];

    // 1. ADMIN always gets everything
    rooms.push('role:ADMIN');

    // 2. Organization-level: REGIONAL_ADMIN, FRANCHISE_OWNER, PARTNER_ADMIN
    if (context.organizationId) {
        rooms.push(`organization:${context.organizationId}`);
    }

    // 3. Location-level: LOCATION_MANAGER, COACH, location-bound users
    if (context.locationId) {
        rooms.push(`location:${context.locationId}`);
    }

    // 4. Direct user notification (the affected user)
    if (context.targetUserId) {
        rooms.push(`user:${context.targetUserId}`);
    }

    // 5. Support staff for support-related entities
    if (SUPPORT_ENTITIES.includes(entity)) {
        rooms.push('role:SUPPORT_STAFF');
    }

    // 6. Any additional rooms specified by the service
    if (context.additionalRooms) {
        rooms.push(...context.additionalRooms);
    }

    // Deduplicate
    return [...new Set(rooms)];
}

/**
 * Sanitize a Mongoose document for transmission — strip internal fields
 */
function sanitizeDocument(doc: any): Record<string, any> {
    if (!doc) return {};
    const obj = doc.toObject ? doc.toObject() : (typeof doc === 'object' ? { ...doc } : { id: doc });

    // Remove sensitive/internal fields
    delete obj.__v;
    delete obj.password;
    delete obj.passwordHash;
    delete obj.refreshToken;

    return obj;
}

/**
 * Generate a human-readable notification title from entity + action
 */
function generateNotificationTitle(entity: string, action: string): string {
    const entityName = entity.charAt(0).toUpperCase() + entity.slice(1);
    switch (action) {
        case 'created': return `New ${entityName} Created`;
        case 'updated': return `${entityName} Updated`;
        case 'deleted': return `${entityName} Removed`;
        case 'cancelled': return `${entityName} Cancelled`;
        default: return `${entityName} ${action.charAt(0).toUpperCase() + action.slice(1)}`;
    }
}

/**
 * Generate a notification message from entity + action + data
 */
function generateNotificationMessage(entity: string, action: string, data: Record<string, any>): string {
    const name = data.name || data.title || data.className || data.programName || '';
    const entityName = entity.charAt(0).toUpperCase() + entity.slice(1);

    if (name) {
        switch (action) {
            case 'created': return `A new ${entity} "${name}" has been created`;
            case 'updated': return `${entityName} "${name}" has been updated`;
            case 'deleted': return `${entityName} "${name}" has been removed`;
            case 'cancelled': return `${entityName} "${name}" has been cancelled`;
            default: return `${entityName} "${name}" — ${action}`;
        }
    }

    switch (action) {
        case 'created': return `A new ${entity} has been created`;
        case 'updated': return `A ${entity} has been updated`;
        case 'deleted': return `A ${entity} has been removed`;
        case 'cancelled': return `A ${entity} has been cancelled`;
        default: return `${entityName} action: ${action}`;
    }
}

/**
 * Main function: emit a real-time event to all affected rooms
 * Called from BaseService hooks or directly from service methods
 */
export function emitEntityEvent(
    entity: string,
    action: string,
    data: any,
    context: EntityContext | null
): void {
    if (!ioInstance || !context) return;

    try {
        const eventName = `${entity}:${action}`;
        const rooms = resolveTargetRooms(entity, action, context);
        const sanitizedData = sanitizeDocument(data);

        const payload: RealtimeEvent = {
            event: eventName,
            entity,
            action,
            data: sanitizedData,
            context,
            timestamp: new Date().toISOString(),
            actorId: context.userId,
        };

        // Emit to each resolved room
        for (const room of rooms) {
            ioInstance.to(room).emit(eventName, payload);
        }

        logger.info(`[Realtime] Emitted ${eventName} to rooms: [${rooms.join(', ')}]`);

        // Persist as in-app notification (async, fire-and-forget)
        const title = generateNotificationTitle(entity, action);
        const message = generateNotificationMessage(entity, action, sanitizedData);
        persistNotification(entity, action, sanitizedData, context, title, message).catch((err) => {
            logger.warn(`[Realtime] Failed to persist notification: ${err.message}`);
        });
    } catch (error: any) {
        logger.error(`[Realtime] Error emitting event: ${error.message}`);
    }
}

/**
 * Emit a custom event directly (not tied to a CRUD operation)
 */
export function emitCustomEvent(eventName: string, data: any, rooms: string[]): void {
    if (!ioInstance) return;

    for (const room of rooms) {
        ioInstance.to(room).emit(eventName, {
            event: eventName,
            data,
            timestamp: new Date().toISOString(),
        });
    }
}
