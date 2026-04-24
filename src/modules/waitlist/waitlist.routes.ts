import { Router, Request, Response } from 'express';
import { WaitlistController } from './waitlist.controller';
import { authenticate } from '../iam/auth.middleware';
import { UserRole } from '../../shared/enums';
import { validate } from '../../middleware/validation.middleware';
import { body, param, query } from 'express-validator';

// Simple authorization middleware
const authorize = (roles: string[]) => (req: any, res: Response, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Unauthorized access'
        });
    }
    next();
};

const router = Router();
const controller = new WaitlistController(
    require('./waitlist.service').WaitlistService
);

/**
 * @route   POST /api/v1/waitlist
 * @desc    Add student to waitlist
 * @access  Private - LOCATION_MANAGER, ADMIN, SUPPORT_STAFF
 */
router.post(
    '/',
    authenticate,
    authorize([UserRole.LOCATION_MANAGER, UserRole.ADMIN, UserRole.SUPPORT_STAFF]),
    validate([
        body('studentId').notEmpty().withMessage('Student ID is required'),
        body('classId').notEmpty().withMessage('Class ID is required'),
        body('locationId').notEmpty().withMessage('Location ID is required'),
        body('priority').optional().isIn(['HIGH', 'MEDIUM', 'LOW']).withMessage('Invalid priority'),
        body('notes').optional().isString().withMessage('Notes must be a string'),
    ]),
    async (req: Request, res: Response) => {
        try {
            const result = await controller.createWaitlistEntry(req.body, req);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to add student to waitlist',
                error: error.message
            });
        }
    }
);

/**
 * @route   GET /api/v1/waitlist/location/:locationId
 * @desc    Get waitlist entries for location
 * @access  Private - LOCATION_MANAGER, ADMIN, SUPPORT_STAFF
 */
router.get(
    '/location/:locationId',
    authenticate,
    authorize([UserRole.LOCATION_MANAGER, UserRole.ADMIN, UserRole.SUPPORT_STAFF]),
    validate([
        param('locationId').notEmpty().withMessage('Location ID is required'),
        query('status').optional().isIn(['WAITING', 'OFFERED', 'ACCEPTED', 'REJECTED', 'CANCELLED']).withMessage('Invalid status'),
        query('priority').optional().isIn(['HIGH', 'MEDIUM', 'LOW']).withMessage('Invalid priority'),
        query('classId').optional().notEmpty().withMessage('Class ID must not be empty'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
        query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
        query('sortBy').optional().isIn(['createdAt', 'priority', 'position']).withMessage('Invalid sort field'),
        query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
    ]),
    async (req: Request, res: Response) => {
        try {
            const result = await controller.getLocationWaitlist(
                req.params.locationId,
                req.query
            );
            res.json(result);
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to retrieve waitlist entries',
                error: error.message
            });
        }
    }
);

/**
 * @route   GET /api/v1/waitlist/class/:classId
 * @desc    Get waitlist entries for specific class
 * @access  Private - LOCATION_MANAGER, ADMIN, SUPPORT_STAFF
 */
router.get(
    '/class/:classId',
    authenticate,
    authorize([UserRole.LOCATION_MANAGER, UserRole.ADMIN, UserRole.SUPPORT_STAFF]),
    validate([
        param('classId').notEmpty().withMessage('Class ID is required'),
        query('status').optional().isIn(['WAITING', 'OFFERED', 'ACCEPTED', 'REJECTED', 'CANCELLED']).withMessage('Invalid status'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
        query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
    ]),
    async (req: Request, res: Response) => {
        try {
            const result = await controller.getClassWaitlist(
                req.params.classId,
                req.query
            );
            res.json(result);
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to retrieve class waitlist',
                error: error.message
            });
        }
    }
);

/**
 * @route   GET /api/v1/waitlist/student/:studentId
 * @desc    Get waitlist entries for student
 * @access  Private - LOCATION_MANAGER, ADMIN, SUPPORT_STAFF, PARENT
 */
router.get(
    '/student/:studentId',
    authenticate,
    authorize([UserRole.LOCATION_MANAGER, UserRole.ADMIN, UserRole.SUPPORT_STAFF, UserRole.PARENT]),
    validate([
        param('studentId').notEmpty().withMessage('Student ID is required'),
    ]),
    async (req: Request, res: Response) => {
        try {
            const result = await controller.getStudentWaitlist(req.params.studentId);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to retrieve student waitlist entries',
                error: error.message
            });
        }
    }
);

/**
 * @route   PUT /api/v1/waitlist/:id/offer
 * @desc    Offer spot to waitlisted student
 * @access  Private - LOCATION_MANAGER, ADMIN
 */
router.put(
    '/:id/offer',
    authenticate,
    authorize([UserRole.LOCATION_MANAGER, UserRole.ADMIN]),
    validate([
        param('id').notEmpty().withMessage('Waitlist entry ID is required'),
        body('expiresIn').optional().isInt({ min: 1 }).withMessage('Expiration time must be positive'),
    ]),
    async (req: Request, res: Response) => {
        try {
            const result = await controller.offerSpot(req.params.id, req);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to offer spot',
                error: error.message
            });
        }
    }
);

/**
 * @route   PUT /api/v1/waitlist/:id/accept
 * @desc    Accept waitlist offer
 * @access  Private - PARENT, LOCATION_MANAGER, ADMIN
 */
router.put(
    '/:id/accept',
    authenticate,
    authorize([UserRole.PARENT, UserRole.LOCATION_MANAGER, UserRole.ADMIN]),
    validate([
        param('id').notEmpty().withMessage('Waitlist entry ID is required'),
    ]),
    async (req: Request, res: Response) => {
        try {
            const result = await controller.acceptOffer(req.params.id);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to accept offer',
                error: error.message
            });
        }
    }
);

/**
 * @route   PUT /api/v1/waitlist/:id/reject
 * @desc    Reject waitlist offer
 * @access  Private - PARENT, LOCATION_MANAGER, ADMIN
 */
router.put(
    '/:id/reject',
    authenticate,
    authorize([UserRole.PARENT, UserRole.LOCATION_MANAGER, UserRole.ADMIN]),
    validate([
        param('id').notEmpty().withMessage('Waitlist entry ID is required'),
        body('reason').optional().isString().withMessage('Reason must be a string'),
    ]),
    async (req: Request, res: Response) => {
        try {
            const result = await controller.rejectOffer(req.params.id, req.body);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to reject offer',
                error: error.message
            });
        }
    }
);

/**
 * @route   DELETE /api/v1/waitlist/:id
 * @desc    Remove from waitlist
 * @access  Private - LOCATION_MANAGER, ADMIN, PARENT
 */
router.delete(
    '/:id',
    authenticate,
    authorize([UserRole.LOCATION_MANAGER, UserRole.ADMIN, UserRole.PARENT]),
    validate([
        param('id').notEmpty().withMessage('Waitlist entry ID is required'),
        body('reason').optional().isString().withMessage('Reason must be a string'),
    ]),
    async (req: Request, res: Response) => {
        try {
            const result = await controller.removeFromWaitlist(req.params.id, req);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to remove from waitlist',
                error: error.message
            });
        }
    }
);

/**
 * @route   GET /api/v1/waitlist/:id
 * @desc    Get waitlist entry details
 * @access  Private - LOCATION_MANAGER, ADMIN, SUPPORT_STAFF, PARENT
 */
router.get(
    '/:id',
    authenticate,
    authorize([UserRole.LOCATION_MANAGER, UserRole.ADMIN, UserRole.SUPPORT_STAFF, UserRole.PARENT]),
    validate([
        param('id').notEmpty().withMessage('Waitlist entry ID is required'),
    ]),
    async (req: Request, res: Response) => {
        try {
            const result = await controller.getWaitlistEntry(req.params.id);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to retrieve waitlist entry',
                error: error.message
            });
        }
    }
);

/**
 * @route   PUT /api/v1/waitlist/:id/priority
 * @desc    Update waitlist entry priority
 * @access  Private - LOCATION_MANAGER, ADMIN
 */
router.put(
    '/:id/priority',
    authenticate,
    authorize([UserRole.LOCATION_MANAGER, UserRole.ADMIN]),
    validate([
        param('id').notEmpty().withMessage('Waitlist entry ID is required'),
        body('priority').notEmpty().isIn(['HIGH', 'MEDIUM', 'LOW']).withMessage('Valid priority is required'),
    ]),
    async (req: Request, res: Response) => {
        try {
            const result = await controller.updatePriority(req.params.id, req.body.priority);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update priority',
                error: error.message
            });
        }
    }
);

export default router;
