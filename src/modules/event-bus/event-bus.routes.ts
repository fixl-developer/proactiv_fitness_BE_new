import { Router } from 'express';
import { EventBusController, EventSubscriptionController, MessageQueueController } from './event-bus.controller';
import { authMiddleware } from '../iam/auth.middleware';
import { validateRequest } from '../../shared/utils/validation.util';
import { body, param, query } from 'express-validator';

const router = Router();
const eventBusController = new EventBusController();
const subscriptionController = new EventSubscriptionController();
const queueController = new MessageQueueController();

// Event Bus Routes

/**
 * @route   POST /api/v1/events
 * @desc    Publish event
 * @access  Private
 */
router.post('/events',
    authMiddleware,
    body('eventType').isString().withMessage('Event type is required'),
    body('payload').isObject().withMessage('Event payload is required'),
    validateRequest,
    eventBusController.publishEvent
);

/**
 * @route   GET /api/v1/events
 * @desc    Get all events
 * @access  Private (Admin, Manager)
 */
router.get('/events',
    authMiddleware,
    eventBusController.getEvents
);

/**
 * @route   GET /api/v1/events/statistics
 * @desc    Get event statistics
 * @access  Private (Admin, Manager)
 */
router.get('/events/statistics',
    authMiddleware,
    eventBusController.getEventStatistics
);

/**
 * @route   GET /api/v1/events/:id
 * @desc    Get event by ID
 * @access  Private (Admin, Manager)
 */
router.get('/events/:id',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid event ID is required'),
    validateRequest,
    eventBusController.getEventById
);

/**
 * @route   POST /api/v1/events/:eventId/retry
 * @desc    Retry failed event
 * @access  Private (Admin, Manager)
 */
router.post('/events/:eventId/retry',
    authMiddleware,
    param('eventId').isString().withMessage('Valid event ID is required'),
    validateRequest,
    eventBusController.retryEvent
);

// Event Subscription Routes

/**
 * @route   POST /api/v1/subscriptions
 * @desc    Create event subscription
 * @access  Private (Admin, Manager)
 */
router.post('/subscriptions',
    authMiddleware,
    body('name').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Subscription name is required (1-100 characters)'),
    body('eventTypes').isArray({ min: 1 }).withMessage('At least one event type is required'),
    body('handlerType').isIn(['webhook', 'function', 'queue', 'email', 'sms']).withMessage('Valid handler type is required'),
    body('handlerConfig').isObject().withMessage('Handler config is required'),
    validateRequest,
    subscriptionController.createSubscription
);

/**
 * @route   GET /api/v1/subscriptions
 * @desc    Get all subscriptions
 * @access  Private (Admin, Manager)
 */
router.get('/subscriptions',
    authMiddleware,
    subscriptionController.getSubscriptions
);

/**
 * @route   PATCH /api/v1/subscriptions/:subscriptionId/status
 * @desc    Update subscription status
 * @access  Private (Admin, Manager)
 */
router.patch('/subscriptions/:subscriptionId/status',
    authMiddleware,
    param('subscriptionId').isString().withMessage('Valid subscription ID is required'),
    body('status').isIn(['active', 'paused', 'disabled', 'error']).withMessage('Valid status is required'),
    validateRequest,
    subscriptionController.updateSubscriptionStatus
);

/**
 * @route   GET /api/v1/subscriptions/:subscriptionId/logs
 * @desc    Get event logs for subscription
 * @access  Private (Admin, Manager)
 */
router.get('/subscriptions/:subscriptionId/logs',
    authMiddleware,
    param('subscriptionId').isString().withMessage('Valid subscription ID is required'),
    query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
    validateRequest,
    subscriptionController.getEventLogs
);

// Message Queue Routes

/**
 * @route   POST /api/v1/queues
 * @desc    Create message queue
 * @access  Private (Admin, Manager)
 */
router.post('/queues',
    authMiddleware,
    body('queueName').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Queue name is required (1-100 characters)'),
    body('maxSize').isInt({ min: 1 }).withMessage('Max size must be at least 1'),
    body('ttl').isInt({ min: 1 }).withMessage('TTL must be at least 1 second'),
    body('concurrency').isInt({ min: 1 }).withMessage('Concurrency must be at least 1'),
    body('batchSize').isInt({ min: 1 }).withMessage('Batch size must be at least 1'),
    body('visibilityTimeout').isInt({ min: 1 }).withMessage('Visibility timeout must be at least 1 second'),
    validateRequest,
    queueController.createQueue
);

/**
 * @route   GET /api/v1/queues
 * @desc    Get all queues
 * @access  Private (Admin, Manager)
 */
router.get('/queues',
    authMiddleware,
    queueController.getQueues
);

/**
 * @route   GET /api/v1/queues/statistics
 * @desc    Get queue statistics
 * @access  Private (Admin, Manager)
 */
router.get('/queues/statistics',
    authMiddleware,
    queueController.getQueueStatistics
);

/**
 * @route   POST /api/v1/queues/messages
 * @desc    Enqueue message
 * @access  Private
 */
router.post('/queues/messages',
    authMiddleware,
    body('queueName').isString().withMessage('Queue name is required'),
    body('payload').isObject().withMessage('Message payload is required'),
    body('priority').optional().isIn(['low', 'normal', 'high', 'critical']).withMessage('Valid priority is required'),
    validateRequest,
    queueController.enqueueMessage
);

/**
 * @route   GET /api/v1/queues/:queueName/messages
 * @desc    Dequeue message
 * @access  Private
 */
router.get('/queues/:queueName/messages',
    authMiddleware,
    param('queueName').isString().withMessage('Valid queue name is required'),
    validateRequest,
    queueController.dequeueMessage
);

/**
 * @route   PATCH /api/v1/messages/:messageId/complete
 * @desc    Complete message processing
 * @access  Private
 */
router.patch('/messages/:messageId/complete',
    authMiddleware,
    param('messageId').isString().withMessage('Valid message ID is required'),
    validateRequest,
    queueController.completeMessage
);

export default router;