import { Request, Response } from 'express';
import { EventBusService, MessageQueueService } from './event-bus.service';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';
import { ResponseUtil } from '../../shared/utils/response.util';
import { PaginationUtil } from '../../shared/utils/pagination.util';

export class EventBusController {
    private eventBusService: EventBusService;

    constructor() {
        this.eventBusService = new EventBusService();
    }

    /**
     * Publish event
     */
    publishEvent = asyncHandler(async (req: Request, res: Response) => {
        const event = await this.eventBusService.publishEvent(req.body, req.user.id);
        ResponseUtil.success(res, event, 'Event published successfully', HTTP_STATUS.CREATED);
    });

    /**
     * Get all events
     */
    getEvents = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit, skip } = PaginationUtil.getPaginationParams(req.query);
        const filters = this.buildEventFilters(req.query);

        const result: any = await (this.eventBusService as any).findAll(filters, {
            page,
            limit,
            skip,
            sort: { occurredAt: -1 }
        });

        ResponseUtil.success(res, result, 'Events retrieved successfully');
    });

    /**
     * Get event by ID
     */
    getEventById = asyncHandler(async (req: Request, res: Response) => {
        const event = await this.eventBusService.findById(req.params.id);
        if (!event) {
            throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);
        }

        ResponseUtil.success(res, event, 'Event retrieved successfully');
    });

    /**
     * Retry failed event
     */
    retryEvent = asyncHandler(async (req: Request, res: Response) => {
        const event = await this.eventBusService.retryEvent(req.params.eventId, req.user.id);
        ResponseUtil.success(res, event, 'Event retry initiated successfully');
    });

    /**
     * Get event statistics
     */
    getEventStatistics = asyncHandler(async (req: Request, res: Response) => {
        const { businessUnitId } = req.query;
        const statistics = await this.eventBusService.getEventStatistics(
            businessUnitId as string
        );

        ResponseUtil.success(res, statistics, 'Event statistics retrieved successfully');
    });

    private buildEventFilters(query: any) {
        const filters: any = {};

        if (query.eventType) filters.eventType = query.eventType;
        if (query.status) filters.status = query.status;
        if (query.priority) filters.priority = query.priority;
        if (query.businessUnitId) filters['metadata.businessUnitId'] = query.businessUnitId;
        if (query.correlationId) filters['metadata.correlationId'] = query.correlationId;
        if (query.userId) filters['metadata.userId'] = query.userId;

        if (query.dateFrom || query.dateTo) {
            filters.occurredAt = {};
            if (query.dateFrom) filters.occurredAt.$gte = new Date(query.dateFrom);
            if (query.dateTo) filters.occurredAt.$lte = new Date(query.dateTo);
        }

        return filters;
    }
}

export class EventSubscriptionController {
    private eventBusService: EventBusService;

    constructor() {
        this.eventBusService = new EventBusService();
    }

    /**
     * Create subscription
     */
    createSubscription = asyncHandler(async (req: Request, res: Response) => {
        const subscription = await this.eventBusService.createSubscription(req.body, req.user.id);
        ResponseUtil.success(res, subscription, 'Subscription created successfully', HTTP_STATUS.CREATED);
    });

    /**
     * Get all subscriptions
     */
    getSubscriptions = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit, skip } = PaginationUtil.getPaginationParams(req.query);
        const filters = this.buildSubscriptionFilters(req.query);

        // Using EventSubscription model directly for subscriptions
        const subscriptions: any = await (this.eventBusService as any).findAll(filters, {
            page,
            limit,
            skip,
            sort: { createdAt: -1 }
        });

        ResponseUtil.success(res, subscriptions?.data ?? subscriptions, 'Subscriptions retrieved successfully', HTTP_STATUS.OK);
    });

    /**
     * Update subscription status
     */
    updateSubscriptionStatus = asyncHandler(async (req: Request, res: Response) => {
        const { status } = req.body;
        const subscription = await this.eventBusService.updateSubscriptionStatus(
            req.params.subscriptionId,
            status,
            req.user.id
        );

        ResponseUtil.success(res, subscription, 'Subscription status updated successfully');
    });

    /**
     * Get event logs for subscription
     */
    getEventLogs = asyncHandler(async (req: Request, res: Response) => {
        const { limit = 100 } = req.query;
        const logs = await this.eventBusService.getEventLogs(
            req.params.subscriptionId,
            parseInt(limit as string)
        );

        ResponseUtil.success(res, logs, 'Event logs retrieved successfully');
    });

    private buildSubscriptionFilters(query: any) {
        const filters: any = {};

        if (query.eventType) filters.eventTypes = { $in: [query.eventType] };
        if (query.status) filters.status = query.status;
        if (query.handlerType) filters.handlerType = query.handlerType;
        if (query.businessUnitId) filters.businessUnitId = query.businessUnitId;
        if (query.locationId) filters.locationIds = query.locationId;
        if (query.isActive !== undefined) filters.isActive = query.isActive === 'true';

        return filters;
    }
}

export class MessageQueueController {
    private messageQueueService: MessageQueueService;

    constructor() {
        this.messageQueueService = new MessageQueueService();
    }

    /**
     * Create queue
     */
    createQueue = asyncHandler(async (req: Request, res: Response) => {
        const queue = await this.messageQueueService.createQueue(req.body, req.user.id);
        ResponseUtil.success(res, queue, 'Queue created successfully', HTTP_STATUS.CREATED);
    });

    /**
     * Get all queues
     */
    getQueues = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit, skip } = PaginationUtil.getPaginationParams(req.query);
        const filters = { isActive: true };

        const result: any = await (this.messageQueueService as any).findAll(filters, {
            page,
            limit,
            skip,
            sort: { createdAt: -1 }
        });

        ResponseUtil.success(res, result, 'Queues retrieved successfully');
    });

    /**
     * Enqueue message
     */
    enqueueMessage = asyncHandler(async (req: Request, res: Response) => {
        const { queueName, payload, priority } = req.body;
        const message = await this.messageQueueService.enqueueMessage(queueName, payload, priority);
        ResponseUtil.success(res, message, 'Message enqueued successfully', HTTP_STATUS.CREATED);
    });

    /**
     * Dequeue message
     */
    dequeueMessage = asyncHandler(async (req: Request, res: Response) => {
        const { queueName } = req.params;
        const message = await this.messageQueueService.dequeueMessage(queueName);

        if (!message) {
            ResponseUtil.success(res, null, 'No messages available');
        } else {
            ResponseUtil.success(res, message, 'Message dequeued successfully');
        }
    });

    /**
     * Complete message
     */
    completeMessage = asyncHandler(async (req: Request, res: Response) => {
        const { messageId } = req.params;
        await this.messageQueueService.completeMessage(messageId);
        ResponseUtil.success(res, null, 'Message completed successfully');
    });

    /**
     * Get queue statistics
     */
    getQueueStatistics = asyncHandler(async (req: Request, res: Response) => {
        const statistics = await this.messageQueueService.getQueueStatistics();
        ResponseUtil.success(res, statistics, 'Queue statistics retrieved successfully');
    });
}

