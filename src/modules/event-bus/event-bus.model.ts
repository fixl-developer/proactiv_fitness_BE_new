import { Schema, model } from 'mongoose';
import {
    IEvent,
    IEventSubscription,
    IEventLog,
    IMessageQueue,
    IQueueMessage,
    EventType,
    EventPriority,
    EventStatus,
    SubscriptionStatus
} from './event-bus.interface';
import { baseSchemaOptions } from '../../shared/base/base.model';

// Event Metadata Schema
const eventMetadataSchema = new Schema({
    source: {
        type: String,
        required: [true, 'Event source is required'],
        trim: true
    },
    version: {
        type: String,
        required: [true, 'Event version is required'],
        trim: true
    },
    // @ts-ignore - Mongoose type issue
    correlationId: {
        type: String,
        trim: true,
        index: true
    },
    causationId: {
        type: String,
        trim: true,
        index: true
    },
    userId: {
        type: String,
        ref: 'User',
        index: true
    },
    // @ts-ignore - Mongoose type issue
    sessionId: {
        type: String,
        trim: true
    },
    ipAddress: {
        type: String,
        trim: true
    },
    userAgent: {
        type: String,
        trim: true
    },
    businessUnitId: {
        type: String,
        ref: 'BusinessUnit',
        index: true
    },
    // @ts-ignore - Mongoose type issue
    locationId: {
        type: String,
        ref: 'Location',
        index: true
    },
    tags: [String],
    customData: {
        type: Map,
        of: Schema.Types.Mixed
    }
});

// Event Schema
const eventSchema = new Schema<IEvent>({
    // Basic Information
    // @ts-ignore - Mongoose type issue
    eventId: {
        type: String,
        required: [true, 'Event ID is required'],
        unique: true,
        trim: true,
        index: true
    },
    eventType: {
        type: String,
        enum: Object.values(EventType),
        required: [true, 'Event type is required'],
        index: true
    },
    eventName: {
        type: String,
        required: [true, 'Event name is required'],
        trim: true,
        index: true
    },

    // Content
    payload: {
        type: Schema.Types.Mixed,
        required: [true, 'Event payload is required']
    },
    metadata: {
        type: eventMetadataSchema,
        required: [true, 'Event metadata is required']
    },

    // Processing
    priority: {
        type: String,
        enum: Object.values(EventPriority),
        default: EventPriority.NORMAL,
        index: true
    },
    status: {
        type: String,
        enum: Object.values(EventStatus),
        default: EventStatus.PENDING,
        index: true
    },

    // Timing
    occurredAt: {
        type: Date,
        required: [true, 'Occurred at is required'],
        index: true
    },
    scheduledFor: {
        type: Date,
        index: true
    },
    processedAt: {
        type: Date,
        index: true
    },
    completedAt: {
        type: Date,
        index: true
    },

    // Retry Logic
    retryCount: {
        type: Number,
        default: 0,
        min: [0, 'Retry count cannot be negative']
    },
    maxRetries: {
        type: Number,
        default: 3,
        min: [0, 'Max retries cannot be negative']
    },
    nextRetryAt: {
        type: Date,
        index: true
    },
    lastError: {
        type: String,
        trim: true
    },

    // Routing
    routingKey: {
        type: String,
        required: [true, 'Routing key is required'],
        trim: true,
        index: true
    },
    exchange: {
        type: String,
        trim: true
    },

    // Versioning
    schemaVersion: {
        type: String,
        required: [true, 'Schema version is required'],
        trim: true
    }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Event Subscription Schema
const subscriptionFilterSchema = new Schema({
    field: {
        type: String,
        required: [true, 'Filter field is required'],
        trim: true
    },
    operator: {
        type: String,
        enum: ['equals', 'not_equals', 'contains', 'not_contains', 'in', 'not_in'],
        required: [true, 'Filter operator is required']
    },
    value: {
        type: Schema.Types.Mixed,
        required: [true, 'Filter value is required']
    }
});

const handlerConfigSchema = new Schema({
    url: {
        type: String,
        trim: true
    },
    method: {
        type: String,
        enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        default: 'POST'
    },
    headers: {
        type: Map,
        of: String
    },
    functionName: {
        type: String,
        trim: true
    },
    queueName: {
        type: String,
        trim: true
    },
    emailTemplate: {
        type: String,
        trim: true
    },
    smsTemplate: {
        type: String,
        trim: true
    },
    retryPolicy: {
        maxRetries: {
            type: Number,
            default: 3,
            min: [0, 'Max retries cannot be negative']
        },
        backoffStrategy: {
            type: String,
            enum: ['linear', 'exponential'],
            default: 'exponential'
        },
        initialDelay: {
            type: Number,
            default: 1000,
            min: [0, 'Initial delay cannot be negative']
        },
        maxDelay: {
            type: Number,
            default: 300000,
            min: [0, 'Max delay cannot be negative']
        }
    }
});

const eventSubscriptionSchema = new Schema<IEventSubscription>({
    // Basic Information
    subscriptionId: {
        type: String,
        required: [true, 'Subscription ID is required'],
        unique: true,
        trim: true,
        index: true
    },
    name: {
        type: String,
        required: [true, 'Subscription name is required'],
        trim: true,
        maxlength: [100, 'Subscription name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },

    // Event Filtering
    eventTypes: [{
        type: String,
        enum: Object.values(EventType),
        required: [true, 'At least one event type is required']
    }],
    eventPatterns: [String],
    filters: [subscriptionFilterSchema],

    // Handler Configuration
    handlerType: {
        type: String,
        enum: ['webhook', 'function', 'queue', 'email', 'sms'],
        required: [true, 'Handler type is required']
    },
    handlerConfig: {
        type: handlerConfigSchema,
        required: [true, 'Handler config is required']
    },

    // Status and Control
    status: {
        type: String,
        enum: Object.values(SubscriptionStatus),
        default: SubscriptionStatus.ACTIVE,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },

    // Processing Stats
    statistics: {
        totalEvents: {
            type: Number,
            default: 0,
            min: [0, 'Total events cannot be negative']
        },
        successfulEvents: {
            type: Number,
            default: 0,
            min: [0, 'Successful events cannot be negative']
        },
        failedEvents: {
            type: Number,
            default: 0,
            min: [0, 'Failed events cannot be negative']
        },
        lastProcessedAt: Date,
        averageProcessingTime: {
            type: Number,
            default: 0,
            min: [0, 'Average processing time cannot be negative']
        }
    },

    // Business Context
    businessUnitId: {
        type: String,
        ref: 'BusinessUnit',
        index: true
    },
    locationIds: [{
        type: String,
        ref: 'Location'
    }],

    // Audit
    createdBy: {
        type: String,
        ref: 'User',
        required: [true, 'Created by is required']
    },
    updatedBy: {
        type: String,
        ref: 'User',
        required: [true, 'Updated by is required']
    }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Event Log Schema
const eventLogSchema = new Schema<IEventLog>({
    // @ts-ignore - Mongoose type issue
    eventId: {
        type: String,
        required: [true, 'Event ID is required'],
        trim: true,
        index: true
    },
    subscriptionId: {
        type: String,
        required: [true, 'Subscription ID is required'],
        trim: true,
        index: true
    },

    // Processing Details
    status: {
        type: String,
        enum: Object.values(EventStatus),
        required: [true, 'Status is required'],
        index: true
    },
    startedAt: {
        type: Date,
        required: [true, 'Started at is required'],
        index: true
    },
    completedAt: {
        type: Date,
        index: true
    },
    processingTime: {
        type: Number,
        min: [0, 'Processing time cannot be negative']
    },

    // Result
    success: {
        type: Boolean,
        required: [true, 'Success status is required'],
        index: true
    },
    response: Schema.Types.Mixed,
    error: {
        type: String,
        trim: true
    },

    // Retry Information
    attemptNumber: {
        type: Number,
        required: [true, 'Attempt number is required'],
        min: [1, 'Attempt number must be at least 1']
    },
    isRetry: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Message Queue Schema
const queueStatisticsSchema = new Schema({
    totalMessages: {
        type: Number,
        default: 0,
        min: [0, 'Total messages cannot be negative']
    },
    pendingMessages: {
        type: Number,
        default: 0,
        min: [0, 'Pending messages cannot be negative']
    },
    processingMessages: {
        type: Number,
        default: 0,
        min: [0, 'Processing messages cannot be negative']
    },
    completedMessages: {
        type: Number,
        default: 0,
        min: [0, 'Completed messages cannot be negative']
    },
    failedMessages: {
        type: Number,
        default: 0,
        min: [0, 'Failed messages cannot be negative']
    },
    deadLetterMessages: {
        type: Number,
        default: 0,
        min: [0, 'Dead letter messages cannot be negative']
    }
});

const messageQueueSchema = new Schema<IMessageQueue>({
    // Queue Information
    queueName: {
        type: String,
        required: [true, 'Queue name is required'],
        unique: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },

    // Configuration
    maxSize: {
        type: Number,
        required: [true, 'Max size is required'],
        min: [1, 'Max size must be at least 1']
    },
    ttl: {
        type: Number,
        required: [true, 'TTL is required'],
        min: [1, 'TTL must be at least 1 second']
    },
    deadLetterQueue: {
        type: String,
        trim: true
    },

    // Processing
    concurrency: {
        type: Number,
        required: [true, 'Concurrency is required'],
        min: [1, 'Concurrency must be at least 1']
    },
    batchSize: {
        type: Number,
        required: [true, 'Batch size is required'],
        min: [1, 'Batch size must be at least 1']
    },
    visibilityTimeout: {
        type: Number,
        required: [true, 'Visibility timeout is required'],
        min: [1, 'Visibility timeout must be at least 1 second']
    },

    // Statistics
    statistics: queueStatisticsSchema,

    // Status
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },

    // Audit
    createdBy: {
        type: String,
        ref: 'User',
        required: [true, 'Created by is required']
    },
    updatedBy: {
        type: String,
        ref: 'User',
        required: [true, 'Updated by is required']
    }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Queue Message Schema
const queueMessageSchema = new Schema<IQueueMessage>({
    // Message Information
    messageId: {
        type: String,
        required: [true, 'Message ID is required'],
        unique: true,
        trim: true,
        index: true
    },
    queueName: {
        type: String,
        required: [true, 'Queue name is required'],
        trim: true,
        index: true
    },

    // Content
    payload: {
        type: Schema.Types.Mixed,
        required: [true, 'Message payload is required']
    },
    headers: {
        type: Map,
        of: String,
        default: new Map()
    },

    // Processing
    status: {
        type: String,
        enum: Object.values(EventStatus),
        default: EventStatus.PENDING,
        index: true
    },
    priority: {
        type: String,
        enum: Object.values(EventPriority),
        default: EventPriority.NORMAL,
        index: true
    },

    // Timing
    enqueuedAt: {
        type: Date,
        required: [true, 'Enqueued at is required'],
        index: true
    },
    visibleAt: {
        type: Date,
        required: [true, 'Visible at is required'],
        index: true
    },
    processedAt: {
        type: Date,
        index: true
    },
    completedAt: {
        type: Date,
        index: true
    },

    // Retry Logic
    retryCount: {
        type: Number,
        default: 0,
        min: [0, 'Retry count cannot be negative']
    },
    maxRetries: {
        type: Number,
        default: 3,
        min: [0, 'Max retries cannot be negative']
    },
    nextRetryAt: {
        type: Date,
        index: true
    },

    // Processing Details
    processingStartedAt: Date,
    processingCompletedAt: Date,
    processingError: {
        type: String,
        trim: true
    }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Indexes for performance
eventSchema.index({ eventType: 1, status: 1, priority: 1 });
eventSchema.index({ occurredAt: 1, status: 1 });
eventSchema.index({ scheduledFor: 1, status: 1 });
eventSchema.index({ 'metadata.businessUnitId': 1, eventType: 1 });
eventSchema.index({ 'metadata.correlationId': 1 });
eventSchema.index({ routingKey: 1, status: 1 });

eventSubscriptionSchema.index({ eventTypes: 1, status: 1 });
eventSubscriptionSchema.index({ businessUnitId: 1, isActive: 1 });
eventSubscriptionSchema.index({ handlerType: 1, status: 1 });

eventLogSchema.index({ eventId: 1, subscriptionId: 1 });
eventLogSchema.index({ startedAt: 1, success: 1 });
eventLogSchema.index({ subscriptionId: 1, success: 1 });

messageQueueSchema.index({ queueName: 1, isActive: 1 });

queueMessageSchema.index({ queueName: 1, status: 1, priority: 1 });
queueMessageSchema.index({ visibleAt: 1, status: 1 });
queueMessageSchema.index({ enqueuedAt: 1, status: 1 });

// Text search indexes
eventSubscriptionSchema.index({
    name: 'text',
    description: 'text'
});

messageQueueSchema.index({
    queueName: 'text',
    description: 'text'
});

// Pre-save middleware
eventSchema.pre('save', function (next) {
    if (this.isNew && !this.eventId) {
        this.eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    if (this.isNew && !this.routingKey) {
        this.routingKey = this.eventType.replace('.', '_');
    }

    if (this.isNew && !this.schemaVersion) {
        this.schemaVersion = '1.0.0';
    }

    next();
});

eventSubscriptionSchema.pre('save', function (next) {
    if (this.isNew && !this.subscriptionId) {
        this.subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

queueMessageSchema.pre('save', function (next) {
    if (this.isNew && !this.messageId) {
        this.messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    if (this.isNew && !this.visibleAt) {
        this.visibleAt = this.enqueuedAt;
    }

    next();
});

// Virtual fields
eventSchema.virtual('isScheduled').get(function () {
    return this.scheduledFor && this.scheduledFor > new Date();
});

eventSchema.virtual('isOverdue').get(function () {
    return this.scheduledFor && this.scheduledFor < new Date() && this.status === EventStatus.PENDING;
});

eventSubscriptionSchema.virtual('successRate').get(function () {
    if (this.statistics.totalEvents === 0) return 0;
    return (this.statistics.successfulEvents / this.statistics.totalEvents) * 100;
});

queueMessageSchema.virtual('isVisible').get(function () {
    return this.visibleAt <= new Date();
});

queueMessageSchema.virtual('isExpired').get(function () {
    const queue = (this as any).parent?.();
    if (!queue || !queue.ttl) return false;
    const expiryTime = new Date(this.enqueuedAt.getTime() + (queue.ttl * 1000));
    return expiryTime < new Date();
});

// Export models
export const Event = model<IEvent>('Event', eventSchema);
export const EventSubscription = model<IEventSubscription>('EventSubscription', eventSubscriptionSchema);
export const EventLog = model<IEventLog>('EventLog', eventLogSchema);
export const MessageQueue = model<IMessageQueue>('MessageQueue', messageQueueSchema);
export const QueueMessage = model<IQueueMessage>('QueueMessage', queueMessageSchema);
