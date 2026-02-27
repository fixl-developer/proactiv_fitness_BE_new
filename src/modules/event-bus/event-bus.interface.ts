import { Document } from 'mongoose';

export enum EventType {
    // User Events
    USER_REGISTERED = 'user.registered',
    USER_UPDATED = 'user.updated',
    USER_DELETED = 'user.deleted',
    USER_LOGIN = 'user.login',
    USER_LOGOUT = 'user.logout',

    // Family Events
    FAMILY_CREATED = 'family.created',
    FAMILY_UPDATED = 'family.updated',
    FAMILY_MEMBER_ADDED = 'family.member_added',
    CHILD_CREATED = 'child.created',
    CHILD_UPDATED = 'child.updated',

    // Booking Events
    BOOKING_CREATED = 'booking.created',
    BOOKING_CONFIRMED = 'booking.confirmed',
    BOOKING_CANCELLED = 'booking.cancelled',
    BOOKING_RESCHEDULED = 'booking.rescheduled',
    BOOKING_COMPLETED = 'booking.completed',
    BOOKING_NO_SHOW = 'booking.no_show',
    WAITLIST_JOINED = 'waitlist.joined',
    WAITLIST_OFFERED = 'waitlist.offered',
    WAITLIST_ACCEPTED = 'waitlist.accepted',

    // Payment Events
    PAYMENT_INITIATED = 'payment.initiated',
    PAYMENT_COMPLETED = 'payment.completed',
    PAYMENT_FAILED = 'payment.failed',
    PAYMENT_REFUNDED = 'payment.refunded',
    INVOICE_GENERATED = 'invoice.generated',
    INVOICE_SENT = 'invoice.sent',
    INVOICE_PAID = 'invoice.paid',
    INVOICE_OVERDUE = 'invoice.overdue',

    // Program Events
    PROGRAM_CREATED = 'program.created',
    PROGRAM_UPDATED = 'program.updated',
    PROGRAM_PUBLISHED = 'program.published',
    PROGRAM_CANCELLED = 'program.cancelled',

    // Schedule Events
    SCHEDULE_GENERATED = 'schedule.generated',
    SCHEDULE_PUBLISHED = 'schedule.published',
    SESSION_CREATED = 'session.created',
    SESSION_UPDATED = 'session.updated',
    SESSION_CANCELLED = 'session.cancelled',
    COACH_ASSIGNED = 'coach.assigned',
    COACH_UNAVAILABLE = 'coach.unavailable',

    // System Events
    SYSTEM_MAINTENANCE = 'system.maintenance',
    SYSTEM_ERROR = 'system.error',
    SYSTEM_ALERT = 'system.alert',
    DATA_BACKUP = 'data.backup',
    DATA_RESTORE = 'data.restore',

    // Custom Events
    CUSTOM_EVENT = 'custom.event'
}

export enum EventPriority {
    LOW = 'low',
    NORMAL = 'normal',
    HIGH = 'high',
    CRITICAL = 'critical'
}

export enum EventStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
    RETRYING = 'retrying',
    DEAD_LETTER = 'dead_letter'
}

export enum SubscriptionStatus {
    ACTIVE = 'active',
    PAUSED = 'paused',
    DISABLED = 'disabled',
    ERROR = 'error'
}

export interface IEventPayload {
    [key: string]: any;
}

export interface IEventMetadata {
    source: string;
    version: string;
    correlationId?: string;
    causationId?: string;
    userId?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    businessUnitId?: string;
    locationId?: string;
    tags?: string[];
    customData?: Record<string, any>;
}

export interface IEvent extends Document {
    // Basic Information
    eventId: string;
    eventType: EventType;
    eventName: string;

    // Content
    payload: IEventPayload;
    metadata: IEventMetadata;

    // Processing
    priority: EventPriority;
    status: EventStatus;

    // Timing
    occurredAt: Date;
    scheduledFor?: Date;
    processedAt?: Date;
    completedAt?: Date;

    // Retry Logic
    retryCount: number;
    maxRetries: number;
    nextRetryAt?: Date;
    lastError?: string;

    // Routing
    routingKey: string;
    exchange?: string;

    // Versioning
    schemaVersion: string;

    // Audit
    createdAt: Date;
    updatedAt: Date;
}

export interface IEventSubscription extends Document {
    // Basic Information
    subscriptionId: string;
    name: string;
    description?: string;

    // Event Filtering
    eventTypes: EventType[];
    eventPatterns: string[];
    filters: {
        field: string;
        operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'in' | 'not_in';
        value: any;
    }[];

    // Handler Configuration
    handlerType: 'webhook' | 'function' | 'queue' | 'email' | 'sms';
    handlerConfig: {
        url?: string;
        method?: string;
        headers?: Record<string, string>;
        functionName?: string;
        queueName?: string;
        emailTemplate?: string;
        smsTemplate?: string;
        retryPolicy?: {
            maxRetries: number;
            backoffStrategy: 'linear' | 'exponential';
            initialDelay: number;
            maxDelay: number;
        };
    };

    // Status and Control
    status: SubscriptionStatus;
    isActive: boolean;

    // Processing Stats
    statistics: {
        totalEvents: number;
        successfulEvents: number;
        failedEvents: number;
        lastProcessedAt?: Date;
        averageProcessingTime: number;
    };

    // Business Context
    businessUnitId?: string;
    locationIds: string[];

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IEventLog extends Document {
    eventId: string;
    subscriptionId: string;

    // Processing Details
    status: EventStatus;
    startedAt: Date;
    completedAt?: Date;
    processingTime?: number;

    // Result
    success: boolean;
    response?: any;
    error?: string;

    // Retry Information
    attemptNumber: number;
    isRetry: boolean;

    // Audit
    createdAt: Date;
}

export interface IMessageQueue extends Document {
    // Queue Information
    queueName: string;
    description?: string;

    // Configuration
    maxSize: number;
    ttl: number; // Time to live in seconds
    deadLetterQueue?: string;

    // Processing
    concurrency: number;
    batchSize: number;
    visibilityTimeout: number;

    // Statistics
    statistics: {
        totalMessages: number;
        pendingMessages: number;
        processingMessages: number;
        completedMessages: number;
        failedMessages: number;
        deadLetterMessages: number;
    };

    // Status
    isActive: boolean;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IQueueMessage extends Document {
    // Message Information
    messageId: string;
    queueName: string;

    // Content
    payload: any;
    headers: Record<string, string>;

    // Processing
    status: EventStatus;
    priority: EventPriority;

    // Timing
    enqueuedAt: Date;
    visibleAt: Date;
    processedAt?: Date;
    completedAt?: Date;

    // Retry Logic
    retryCount: number;
    maxRetries: number;
    nextRetryAt?: Date;

    // Processing Details
    processingStartedAt?: Date;
    processingCompletedAt?: Date;
    processingError?: string;

    // Audit
    createdAt: Date;
    updatedAt: Date;
}

// Request/Response Interfaces
export interface IPublishEventRequest {
    eventType: EventType;
    payload: IEventPayload;
    metadata?: Partial<IEventMetadata>;
    priority?: EventPriority;
    scheduledFor?: Date;
    routingKey?: string;
}

export interface ICreateSubscriptionRequest {
    name: string;
    description?: string;
    eventTypes: EventType[];
    eventPatterns?: string[];
    filters?: {
        field: string;
        operator: string;
        value: any;
    }[];
    handlerType: 'webhook' | 'function' | 'queue' | 'email' | 'sms';
    handlerConfig: any;
    businessUnitId?: string;
    locationIds?: string[];
}

export interface IEventFilter {
    eventTypes?: EventType[];
    status?: EventStatus;
    priority?: EventPriority;
    dateRange?: {
        startDate: Date;
        endDate: Date;
    };
    businessUnitId?: string;
    locationId?: string;
    correlationId?: string;
    userId?: string;
}

export interface ISubscriptionFilter {
    eventTypes?: EventType[];
    status?: SubscriptionStatus;
    handlerType?: string;
    businessUnitId?: string;
    locationId?: string;
    isActive?: boolean;
}

export interface IEventStatistics {
    totalEvents: number;
    eventsByType: Record<EventType, number>;
    eventsByStatus: Record<EventStatus, number>;
    eventsByPriority: Record<EventPriority, number>;
    averageProcessingTime: number;
    successRate: number;
    failureRate: number;
    retryRate: number;
    deadLetterRate: number;
    throughputPerHour: number;
    peakHours: {
        hour: number;
        eventCount: number;
    }[];
}

export interface IQueueStatistics {
    totalQueues: number;
    totalMessages: number;
    messagesByStatus: Record<EventStatus, number>;
    averageProcessingTime: number;
    throughputPerMinute: number;
    queueUtilization: {
        queueName: string;
        utilization: number;
        pendingMessages: number;
        processingMessages: number;
    }[];
}

// Event Handler Interfaces
export interface IEventHandler {
    handle(event: IEvent): Promise<void>;
    canHandle(eventType: EventType): boolean;
    getHandlerName(): string;
}

export interface IEventProcessor {
    processEvent(event: IEvent, subscription: IEventSubscription): Promise<void>;
    retryEvent(event: IEvent, subscription: IEventSubscription): Promise<void>;
    moveToDeadLetter(event: IEvent, reason: string): Promise<void>;
}

// Webhook Interfaces
export interface IWebhookDelivery {
    subscriptionId: string;
    eventId: string;
    url: string;
    method: string;
    headers: Record<string, string>;
    payload: any;
    response?: {
        status: number;
        headers: Record<string, string>;
        body: any;
    };
    deliveredAt?: Date;
    success: boolean;
    error?: string;
    retryCount: number;
}

// Event Replay Interfaces
export interface IEventReplay {
    replayId: string;
    name: string;
    description?: string;

    // Replay Configuration
    eventFilter: IEventFilter;
    targetSubscriptions: string[];
    replaySpeed: number; // Events per second

    // Status
    status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';

    // Progress
    totalEvents: number;
    processedEvents: number;
    failedEvents: number;

    // Timing
    startedAt?: Date;
    completedAt?: Date;
    estimatedCompletionAt?: Date;

    // Audit
    createdBy: string;
    createdAt: Date;
}