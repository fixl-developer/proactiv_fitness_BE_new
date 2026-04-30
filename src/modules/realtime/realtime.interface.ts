import { UserRole } from '@shared/enums';

// Context about the entity being changed — used to determine which rooms receive the event
export interface EntityContext {
    tenantId?: string;
    organizationId?: string;
    locationId?: string;
    userId?: string;         // The user who performed the action
    targetUserId?: string;   // The user affected by the action (e.g., student for attendance)
    additionalRooms?: string[]; // Extra rooms to notify (e.g., individual enrolled students)
}

// The payload sent over Socket.io to clients
export interface RealtimeEvent {
    event: string;           // e.g., 'booking:created'
    entity: string;          // e.g., 'booking'
    action: string;          // 'created' | 'updated' | 'deleted'
    data: Record<string, any>;
    context: EntityContext;
    timestamp: string;
    actorId?: string;
}

// User data attached to authenticated sockets
export interface SocketUser {
    id: string;
    email: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
    tenantId?: string;
    organizationId?: string;
    locationId?: string;
}

// Notification to persist for offline users
export interface PersistentNotification {
    userId: string;
    tenantId: string;
    type: 'in_app';
    category: string;
    title: string;
    message: string;
    eventType: string;
    entityId: string;
    entityType: string;
    metadata: Record<string, any>;
}
