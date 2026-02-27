import { Router } from 'express';
import { ScheduleController } from './schedule.controller';
import { authMiddleware } from '../iam/auth.middleware';
import { validateRequest } from '../../shared/utils/validation.util';
import { body, param, query } from 'express-validator';

const router = Router();
const scheduleController = new ScheduleController();

// Validation rules
const generateScheduleValidation = [
    body('termId').isMongoId().withMessage('Valid term ID is required'),
    body('programIds').isArray({ min: 1 }).withMessage('At least one program ID is required'),
    body('locationIds').isArray({ min: 1 }).withMessage('At least one location ID is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('settings').isObject().withMessage('Settings object is required'),
    validateRequest
];

const updateScheduleValidation = [
    param('id').isMongoId().withMessage('Valid schedule ID is required'),
    body('name').optional().isString().trim().isLength({ min: 1, max: 100 }),
    body('description').optional().isString().trim().isLength({ max: 500 }),
    validateRequest
];

const conflictResolutionValidation = [
    param('conflictId').isMongoId().withMessage('Valid conflict ID is required'),
    body('resolutionType').isIn(['reschedule', 'reassign_coach', 'change_room', 'split_session', 'cancel']),
    body('reason').isString().trim().isLength({ min: 1, max: 200 }),
    validateRequest
];

const dateRangeValidation = [
    query('startDate').isISO8601().withMessage('Valid start date is required'),
    query('endDate').isISO8601().withMessage('Valid end date is required'),
    validateRequest
];

// Routes

/**
 * @route   POST /api/v1/schedules/generate
 * @desc    Generate new schedule
 * @access  Private (Admin, Manager)
 */
router.post('/generate',
    authMiddleware,
    generateScheduleValidation,
    scheduleController.generateSchedule
);

/**
 * @route   GET /api/v1/schedules
 * @desc    Get all schedules with filtering
 * @access  Private
 */
router.get('/',
    authMiddleware,
    scheduleController.getSchedules
);

/**
 * @route   GET /api/v1/schedules/:id
 * @desc    Get schedule by ID
 * @access  Private
 */
router.get('/:id',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid schedule ID is required'),
    validateRequest,
    scheduleController.getScheduleById
);

/**
 * @route   PUT /api/v1/schedules/:id
 * @desc    Update schedule
 * @access  Private (Admin, Manager)
 */
router.put('/:id',
    authMiddleware,
    updateScheduleValidation,
    scheduleController.updateSchedule
);

/**
 * @route   DELETE /api/v1/schedules/:id
 * @desc    Delete schedule
 * @access  Private (Admin, Manager)
 */
router.delete('/:id',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid schedule ID is required'),
    validateRequest,
    scheduleController.deleteSchedule
);

/**
 * @route   POST /api/v1/schedules/:id/publish
 * @desc    Publish schedule
 * @access  Private (Admin, Manager)
 */
router.post('/:id/publish',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid schedule ID is required'),
    validateRequest,
    scheduleController.publishSchedule
);

/**
 * @route   POST /api/v1/schedules/:id/detect-conflicts
 * @desc    Detect conflicts in schedule
 * @access  Private (Admin, Manager)
 */
router.post('/:id/detect-conflicts',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid schedule ID is required'),
    validateRequest,
    scheduleController.detectConflicts
);

/**
 * @route   POST /api/v1/conflicts/:conflictId/resolve
 * @desc    Resolve conflict
 * @access  Private (Admin, Manager)
 */
router.post('/conflicts/:conflictId/resolve',
    authMiddleware,
    conflictResolutionValidation,
    scheduleController.resolveConflict
);

/**
 * @route   GET /api/v1/coaches/:coachId/schedule
 * @desc    Get coach schedule
 * @access  Private
 */
router.get('/coaches/:coachId/schedule',
    authMiddleware,
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
    authMiddleware,
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
    authMiddleware,
    param('sessionId').isMongoId().withMessage('Valid session ID is required'),
    body('requiredSkills').optional().isArray(),
    body('maxTravelTime').optional().isNumeric(),
    validateRequest,
    scheduleController.findSubstituteCoaches
);

export default router;