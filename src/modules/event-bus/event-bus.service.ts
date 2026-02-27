import { FilterQuery } from 'mongoose';
import { Event, EventSubscription, EventLog, MessageQueue, QueueMessage } from './event-bus.model';
import {
    IEvent,
    IEventSubscription,
    IEventLog,
    IMessageQueue,
    IQueueMessage,
    IPublishEventRequest,
    ICreateSubscriptionRequest,
    IEventFilter,
    ISubscriptionFilter,
    IEventStatistics,
    IQueueStatistics,
    EventType,
    EventStatus,
    EventPriority,
    SubscriptionStatus
} from './event-bus.interface';
import { BaseService } from '../../shared/base/base.service';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';

export class EventBusService extends BaseService<IEvent> {
    constructor() {
        super(Event);
    }

    /**
     * Publish event to the event bus
     */
    async publishEvent(eventRequest: IPublishEventRequest, publishedBy: string): Promise<IEvent> {
        try {
            const eventId = this.generateEventId();

            const event = new Event({
                eventId,
                eventType: eventRequest.eventType,
                eventName: eventRequest.eventType.replace('.', '_'),
                payload: eventRequest.payload,
                metadata: {
                    source: 'proactiv-fitness-platform',
                    version: '1.0.0',
                    ...eventRequest.metadata,
                    userId: publishedBy
                },
                priority: eventRequest.priority || EventPriority.NORMAL,
                occurredAt: new Date(),
                scheduledFor: eventRequest.scheduledFor,
                routingKey: eventRequest.routingKey || eventRequest.eventType.replace('.', '_'),
                schemaVersion: '1.0.0'
            });

            await event.save();

            // Process event immediately if not scheduled
            if (!eventRequest.scheduledFor || eventRequest.scheduledFor <= new Date()) {
                await this.processEvent(event);
            }

            return event;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to publish event',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Process event by finding and executing matching subscriptions
     */
    async processEvent(event: IEvent): Promise<void> {
        try {
            // Find matching subscriptions
            const subscriptions = await this.findMatchingSubscriptions(event);

            // Update event status
            event.status = EventStatus.PROCESSING;
            event.processedAt = new Date();
            await event.save();

            // Process each subscription
            const processingPromises = subscriptions.map(subscription =>
                this.executeSubscription(event, subscription)
            );

            await Promise.allSettled(processingPromises);

            // Update event status to completed
            event.status = EventStatus.COMPLETED;
            event.completedAt = new Date();
            await event.save();
        } catch (error: any) {
            // Update event status to failed
            event.status = EventStatus.FAILED;
            event.lastError = error.message;
            await event.save();

            throw new AppError(
                error.message || 'Failed to process event',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Create event subscription
     */
    async createSubscription(
        subscriptionRequest: ICreateSubscriptionRequest,
        createdBy: string
    ): Promise<IEventSubscription> {
        try {
            const subscriptionId = this.generateSubscriptionId();

            const subscription = new EventSubscription({
                subscriptionId,
                name: subscriptionRequest.name,
                description: subscriptionRequest.description,
                eventTypes: subscriptionRequest.eventTypes,
                eventPatterns: subscriptionRequest.eventPatterns || [],
                filters: subscriptionRequest.filters || [],
                handlerType: subscriptionRequest.handlerType,
                handlerConfig: subscriptionRequest.handlerConfig,
                businessUnitId: subscriptionRequest.businessUnitId,
                locationIds: subscriptionRequest.locationIds || [],
                createdBy,
                updatedBy: createdBy
            });

            await subscription.save();
            return subscription;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create subscription',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update subscription status
     */
    async updateSubscriptionStatus(
        subscriptionId: string,
        status: SubscriptionStatus,
        updatedBy: string
    ): Promise<IEventSubscription> {
        try {
            const subscription = await EventSubscription.findOne({ subscriptionId });
            if (!subscription) {
                throw new AppError('Subscription not found', HTTP_STATUS.NOT_FOUND);
            }

            subscription.status = status;
            subscription.isActive = status === SubscriptionStatus.ACTIVE;
            subscription.updatedBy = updatedBy;
            await subscription.save();

            return subscription;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to update subscription status',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get event statistics
     */
    async getEventStatistics(businessUnitId?: string): Promise<IEventStatistics> {
        try {
            const matchStage: any = {};
            if (businessUnitId) {
                matchStage['metadata.businessUnitId'] = businessUnitId;
            }

            const stats = await Event.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalEvents: { $sum: 1 },
                        eventsByType: { $push: '$eventType' },
                        eventsByStatus: { $push: '$status' },
                        eventsByPriority: { $push: '$priority' },
                        totalProcessingTime: { $sum: { $subtract: ['$completedAt', '$processedAt'] } },
                        successfulEvents: {
                            $sum: { $cond: [{ $eq: ['$status', EventStatus.COMPLETED] }, 1, 0] }
                        },
                        failedEvents: {
                            $sum: { $cond: [{ $eq: ['$status', EventStatus.FAILED] }, 1, 0] }
                        }
                    }
                }
            ]);

            const result = stats[0] || {};

            // Calculate rates
            const totalEvents = result.totalEvents || 0;
            const successfulEvents = result.successfulEvents || 0;
            const failedEvents = result.failedEvents || 0;

            const successRate = totalEvents > 0 ? (successfulEvents / totalEvents) * 100 : 0;
            const failureRate = totalEvents > 0 ? (failedEvents / totalEvents) * 100 : 0;

            // Process arrays into counts
            const eventsByType = this.countArrayItems(result.eventsByType || []);
            const eventsByStatus = this.countArrayItems(result.eventsByStatus || []);
            const eventsByPriority = this.countArrayItems(result.eventsByPriority || []);

            return {
                totalEvents,
                eventsByType,
                eventsByStatus,
                eventsByPriority,
                averageProcessingTime: result.totalProcessingTime / (successfulEvents || 1),
                successRate,
                failureRate,
                retryRate: 0, // Would calculate from retry events
                deadLetterRate: 0, // Would calculate from dead letter events
                throughputPerHour: 0, // Would calculate from time-based aggregation
                peakHours: []
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get event statistics',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Retry failed event
     */
    async retryEvent(eventId: string, retriedBy: string): Promise<IEvent> {
        try {
            const event = await Event.findOne({ eventId });
            if (!event) {
                throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);
            }

            if (event.status !== EventStatus.FAILED) {
                throw new AppError('Only failed events can be retried', HTTP_STATUS.BAD_REQUEST);
            }

            if (event.retryCount >= event.maxRetries) {
                throw new AppError('Maximum retry attempts exceeded', HTTP_STATUS.BAD_REQUEST);
            }

            // Update retry information
            event.retryCount += 1;
            event.status = EventStatus.RETRYING;
            event.nextRetryAt = this.calculateNextRetryTime(event.retryCount);
            event.lastError = undefined;

            await event.save();

            // Process the event
            await this.processEvent(event);

            return event;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to retry event',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get event logs for a subscription
     */
    async getEventLogs(subscriptionId: string, limit: number = 100): Promise<IEventLog[]> {
        try {
            return await EventLog.find({ subscriptionId })
                .sort({ createdAt: -1 })
                .limit(limit);
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get event logs',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Private helper methods

    private async findMatchingSubscriptions(event: IEvent): Promise<IEventSubscription[]> {
        const query: FilterQuery<IEventSubscription> = {
            isActive: true,
            status: SubscriptionStatus.ACTIVE,
            eventTypes: { $in: [event.eventType] }
        };

        // Add business unit filter if present
        if (event.metadata.businessUnitId) {
            query.$or = [
                { businessUnitId: { $exists: false } },
                { businessUnitId: event.metadata.businessUnitId }
            ];
        }

        const subscriptions = await EventSubscription.find(query);

        // Apply additional filters
        return subscriptions.filter(subscription =>
            this.matchesEventPatterns(event, subscription) &&
            this.matchesFilters(event, subscription)
        );
    }

    private matchesEventPatterns(event: IEvent, subscription: IEventSubscription): boolean {
        if (!subscription.eventPatterns || subscription.eventPatterns.length === 0) {
            return true;
        }

        return subscription.eventPatterns.some(pattern => {
            const regex = new RegExp(pattern.replace('*', '.*'));
            return regex.test(event.eventType);
        });
    }

    private matchesFilters(event: IEvent, subscription: IEventSubscription): boolean {
        if (!subscription.filters || subscription.filters.length === 0) {
            return true;
        }

        return subscription.filters.every(filter => {
            const fieldValue = this.getFieldValue(event, filter.field);
            return this.evaluateFilter(fieldValue, filter.operator, filter.value);
        });
    }

    private getFieldValue(event: IEvent, field: string): any {
        const parts = field.split('.');
        let value: any = event;

        for (const part of parts) {
            if (value && typeof value === 'object' && part in value) {
                value = value[part];
            } else {
                return undefined;
            }
        }

        return value;
    }

    private evaluateFilter(fieldValue: any, operator: string, filterValue: any): boolean {
        switch (operator) {
            case 'equals':
                return fieldValue === filterValue;
            case 'not_equals':
                return fieldValue !== filterValue;
            case 'contains':
                return String(fieldValue).includes(String(filterValue));
            case 'not_contains':
                return !String(fieldValue).includes(String(filterValue));
            case 'in':
                return Array.isArray(filterValue) && filterValue.includes(fieldValue);
            case 'not_in':
                return Array.isArray(filterValue) && !filterValue.includes(fieldValue);
            default:
                return false;
        }
    }

    private async executeSubscription(event: IEvent, subscription: IEventSubscription): Promise<void> {
        const startTime = Date.now();
        let success = false;
        let response: any = null;
        let error: string | undefined = undefined;

        try {
            // Update subscription statistics
            subscription.statistics.totalEvents += 1;
            subscription.statistics.lastProcessedAt = new Date();

            switch (subscription.handlerType) {
                case 'webhook':
                    response = await this.executeWebhook(event, subscription);
                    break;
                case 'function':
                    response = await this.executeFunction(event, subscription);
                    break;
                case 'queue':
                    response = await this.enqueueMessage(event, subscription);
                    break;
                case 'email':
                    response = await this.sendEmail(event, subscription);
                    break;
                case 'sms':
                    response = await this.sendSMS(event, subscription);
                    break;
                default:
                    throw new Error(`Unsupported handler type: ${subscription.handlerType}`);
            }

            success = true;
            subscription.statistics.successfulEvents += 1;
        } catch (err: any) {
            success = false;
            error = err.message;
            subscription.statistics.failedEvents += 1;
        }

        const processingTime = Date.now() - startTime;

        // Update average processing time
        const totalProcessedEvents = subscription.statistics.successfulEvents + subscription.statistics.failedEvents;
        subscription.statistics.averageProcessingTime =
            (subscription.statistics.averageProcessingTime * (totalProcessedEvents - 1) + processingTime) / totalProcessedEvents;

        await subscription.save();

        // Log the execution
        const eventLog = new EventLog({
            eventId: event.eventId,
            subscriptionId: subscription.subscriptionId,
            status: success ? EventStatus.COMPLETED : EventStatus.FAILED,
            startedAt: new Date(startTime),
            completedAt: new Date(),
            processingTime,
            success,
            response,
            error,
            attemptNumber: 1,
            isRetry: false
        });

        await eventLog.save();
    }

    private async executeWebhook(event: IEvent, subscription: IEventSubscription): Promise<any> {
        // Implementation for webhook execution
        // This would make HTTP request to the configured URL
        return { status: 'webhook_executed' };
    }

    private async executeFunction(event: IEvent, subscription: IEventSubscription): Promise<any> {
        // Implementation for function execution
        // This would call the configured function
        return { status: 'function_executed' };
    }

    private async enqueueMessage(event: IEvent, subscription: IEventSubscription): Promise<any> {
        // Implementation for queue message
        // This would add message to the specified queue
        return { status: 'message_enqueued' };
    }

    private async sendEmail(event: IEvent, subscription: IEventSubscription): Promise<any> {
        // Implementation for email sending
        // This would send email using the configured template
        return { status: 'email_sent' };
    }

    private async sendSMS(event: IEvent, subscription: IEventSubscription): Promise<any> {
        // Implementation for SMS sending
        // This would send SMS using the configured template
        return { status: 'sms_sent' };
    }

    private generateEventId(): string {
        return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateSubscriptionId(): string {
        return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private calculateNextRetryTime(retryCount: number): Date {
        // Exponential backoff: 2^retryCount seconds
        const delaySeconds = Math.pow(2, retryCount);
        return new Date(Date.now() + (delaySeconds * 1000));
    }

    private countArrayItems(items: any[]): Record<string, number> {
        return items.reduce((acc, item) => {
            acc[item] = (acc[item] || 0) + 1;
            return acc;
        }, {});
    }
}

export class MessageQueueService extends BaseService<IMessageQueue> {
    constructor() {
        super(MessageQueue);
    }

    /**
     * Create message queue
     */
    async createQueue(queueData: any, createdBy: string): Promise<IMessageQueue> {
        try {
            const queue = new MessageQueue({
                ...queueData,
                createdBy,
                updatedBy: createdBy
            });

            await queue.save();
            return queue;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create queue',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Enqueue message
     */
    async enqueueMessage(queueName: string, payload: any, priority: EventPriority = EventPriority.NORMAL): Promise<IQueueMessage> {
        try {
            const queue = await MessageQueue.findOne({ queueName, isActive: true });
            if (!queue) {
                throw new AppError('Queue not found or inactive', HTTP_STATUS.NOT_FOUND);
            }

            const messageId = this.generateMessageId();
            const now = new Date();

            const message = new QueueMessage({
                messageId,
                queueName,
                payload,
                priority,
                enqueuedAt: now,
                visibleAt: now
            });

            await message.save();

            // Update queue statistics
            queue.statistics.totalMessages += 1;
            queue.statistics.pendingMessages += 1;
            await queue.save();

            return message;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to enqueue message',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Dequeue message
     */
    async dequeueMessage(queueName: string): Promise<IQueueMessage | null> {
        try {
            const queue = await MessageQueue.findOne({ queueName, isActive: true });
            if (!queue) {
                return null;
            }

            const message = await QueueMessage.findOneAndUpdate(
                {
                    queueName,
                    status: EventStatus.PENDING,
                    visibleAt: { $lte: new Date() }
                },
                {
                    status: EventStatus.PROCESSING,
                    processedAt: new Date(),
                    processingStartedAt: new Date()
                },
                { new: true, sort: { priority: -1, enqueuedAt: 1 } }
            );

            if (message) {
                // Update queue statistics
                queue.statistics.pendingMessages -= 1;
                queue.statistics.processingMessages += 1;
                await queue.save();
            }

            return message;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to dequeue message',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Complete message processing
     */
    async completeMessage(messageId: string): Promise<void> {
        try {
            const message = await QueueMessage.findOne({ messageId });
            if (!message) {
                throw new AppError('Message not found', HTTP_STATUS.NOT_FOUND);
            }

            message.status = EventStatus.COMPLETED;
            message.completedAt = new Date();
            message.processingCompletedAt = new Date();
            await message.save();

            // Update queue statistics
            const queue = await MessageQueue.findOne({ queueName: message.queueName });
            if (queue) {
                queue.statistics.processingMessages -= 1;
                queue.statistics.completedMessages += 1;
                await queue.save();
            }
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to complete message',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get queue statistics
     */
    async getQueueStatistics(): Promise<IQueueStatistics> {
        try {
            const stats = await MessageQueue.aggregate([
                { $match: { isActive: true } },
                {
                    $group: {
                        _id: null,
                        totalQueues: { $sum: 1 },
                        totalMessages: { $sum: '$statistics.totalMessages' },
                        pendingMessages: { $sum: '$statistics.pendingMessages' },
                        processingMessages: { $sum: '$statistics.processingMessages' },
                        completedMessages: { $sum: '$statistics.completedMessages' },
                        failedMessages: { $sum: '$statistics.failedMessages' }
                    }
                }
            ]);

            const result = stats[0] || {};

            return {
                totalQueues: result.totalQueues || 0,
                totalMessages: result.totalMessages || 0,
                messagesByStatus: {
                    [EventStatus.PENDING]: result.pendingMessages || 0,
                    [EventStatus.PROCESSING]: result.processingMessages || 0,
                    [EventStatus.COMPLETED]: result.completedMessages || 0,
                    [EventStatus.FAILED]: result.failedMessages || 0,
                    [EventStatus.RETRYING]: 0,
                    [EventStatus.DEAD_LETTER]: 0
                },
                averageProcessingTime: 0,
                throughputPerMinute: 0,
                queueUtilization: []
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get queue statistics',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    private generateMessageId(): string {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}