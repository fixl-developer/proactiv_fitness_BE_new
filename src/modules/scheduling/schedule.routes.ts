import { Router } from 'express';
import { ScheduleController } from './schedule.controller';
import { authenticate } from '../iam/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { body, param, query } from 'express-validator';

const router = Router();
const scheduleController = new ScheduleController();

// Public routes (no auth required)

/**
 * @route   GET /api/v1/scheduling/available
 * @desc    Get available sessions/time slots for booking
 * @access  Public
 */
router.get('/available',
    scheduleController.getAvailableSessions
);

// Apply authentication to all routes below
router.use(authenticate);

// Validation rules
const generateScheduleValidation = [
    body('termId').isMongoId().withMessage('Valid term ID is required'),
    body('programIds').isArray({ min: 1 }).withMessage('At least one program ID is required'),
    body('locationIds').isArray({ min: 1 }).withMessage('At least one location ID is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('settings').isObject().withMessage('Settings object is required'),
    validate
];

const updateScheduleValidation = [
    param('id').isMongoId().withMessage('Valid schedule ID is required'),
    body('name').optional().isString().trim().isLength({ min: 1, max: 100 }),
    body('description').optional().isString().trim().isLength({ max: 500 }),
    validate
];

const conflictResolutionValidation = [
    param('conflictId').isMongoId().withMessage('Valid conflict ID is required'),
    body('resolutionType').isIn(['reschedule', 'reassign_coach', 'change_room', 'split_session', 'cancel']),
    body('reason').isString().trim().isLength({ min: 1, max: 200 }),
    validate
];

const dateRangeValidation = [
    query('startDate').isISO8601().withMessage('Valid start date is required'),
    query('endDate').isISO8601().withMessage('Valid end date is required'),
    validate
];

// Routes

/**
 * @route   POST /api/v1/schedules/generate
 * @desc    Generate new schedule
 * @access  Private (Admin, Manager)
 */
router.post('/generate',
    authenticate,
    generateScheduleValidation,
    scheduleController.generateSchedule
);

/**
 * @route   GET /api/v1/schedules
 * @desc    Get all schedules with filtering
 * @access  Private
 */
router.get('/',
    authenticate,
    scheduleController.getSchedules
);

/**
 * @route   GET /api/v1/schedules/:id
 * @desc    Get schedule by ID
 * @access  Private
 */
router.get('/:id',
    authenticate,
    param('id').isMongoId().withMessage('Valid schedule ID is required'),
    validate,
    scheduleController.getScheduleById
);

/**
 * @route   PUT /api/v1/schedules/:id
 * @desc    Update schedule
 * @access  Private (Admin, Manager)
 */
router.put('/:id',
    authenticate,
    updateScheduleValidation,
    scheduleController.updateSchedule
);

/**
 * @route   DELETE /api/v1/schedules/:id
 * @desc    Delete schedule
 * @access  Private (Admin, Manager)
 */
router.delete('/:id',
    authenticate,
    param('id').isMongoId().withMessage('Valid schedule ID is required'),
    validate,
    scheduleController.deleteSchedule
);

/**
 * @route   POST /api/v1/schedules/:id/publish
 * @desc    Publish schedule
 * @access  Private (Admin, Manager)
 */
router.post('/:id/publish',
    authenticate,
    param('id').isMongoId().withMessage('Valid schedule ID is required'),
    validate,
    scheduleController.publishSchedule
);

/**
 * @route   POST /api/v1/schedules/:id/detect-conflicts
 * @desc    Detect conflicts in schedule
 * @access  Private (Admin, Manager)
 */
router.post('/:id/detect-conflicts',
    authenticate,
    param('id').isMongoId().withMessage('Valid schedule ID is required'),
    validate,
    scheduleController.detectConflicts
);

/**
 * @route   POST /api/v1/conflicts/:conflictId/resolve
 * @desc    Resolve conflict
 * @access  Private (Admin, Manager)
 */
router.post('/conflicts/:conflictId/resolve',
    authenticate,
    conflictResolutionValidation,
    scheduleController.resolveConflict
);

/**
 * @route   GET /api/v1/coaches/:coachId/schedule
 * @desc    Get coach schedule
 * @access  Private
 */
router.get('/coaches/:coachId/schedule',
    authenticate,
    param('coachId').isMongoId().withMessage('Valid coach ID is required'),
    dateRangeValidation,
    scheduleController.getCoachSchedule
);

/**
 * @route   GET /api/v1/rooms/:roomId/schedule
 * @desc    Get room schedule
 * @access  Private
 */
router.get('/rooms/:roomId/schedule',
    authenticate,
    param('roomId').isMongoId().withMessage('Valid room ID is required'),
    dateRangeValidation,
    scheduleController.getRoomSchedule
);

/**
 * @route   POST /api/v1/sessions/:sessionId/find-substitutes
 * @desc    Find substitute coaches for session
 * @access  Private (Admin, Manager)
 */
router.post('/sessions/:sessionId/find-substitutes',
    authenticate,
    param('sessionId').isMongoId().withMessage('Valid session ID is required'),
    body('requiredSkills').optional().isArray(),
    body('maxTravelTime').optional().isNumeric(),
    validate,
    scheduleController.findSubstituteCoaches
);

export default router;
