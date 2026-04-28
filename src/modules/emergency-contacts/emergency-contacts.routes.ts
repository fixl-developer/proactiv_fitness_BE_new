import { Router, Request, Response } from 'express';
import { EmergencyContactsController } from './emergency-contacts.controller';
import { EmergencyContactsService } from './emergency-contacts.service';
import { authenticate } from '../iam/auth.middleware';
import { UserRole } from '../../shared/enums';
import { validate } from '../../middleware/validation.middleware';
import { body, param, query } from 'express-validator';
import { EmergencyContact } from './emergency-contacts.model';

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

// Initialize service and controller
// Note: Service will be initialized with the model when needed
const controller = new EmergencyContactsController(
    new EmergencyContactsService(EmergencyContact as any)
);

/**
 * @route   POST /api/v1/emergency-contacts
 * @desc    Create emergency contact
 * @access  Private - LOCATION_MANAGER, ADMIN, STAFF, PARENT
 */
router.post(
    '/',
    authenticate,
    authorize([UserRole.LOCATION_MANAGER, UserRole.ADMIN, UserRole.PARENT]),
    validate([
        body('studentId').notEmpty().withMessage('Student ID is required'),
        body('name').notEmpty().withMessage('Contact name is required'),
        body('relationship').notEmpty().withMessage('Relationship is required'),
        body('phone').notEmpty().withMessage('Phone number is required'),
        body('email').optional().isEmail().withMessage('Valid email is required'),
    ]),
    async (req: Request, res: Response) => {
        try {
            const result = await controller.createEmergencyContact(req.body, req);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to create emergency contact',
                error: error.message
            });
        }
    }
);

/**
 * @route   GET /api/v1/emergency-contacts/location/:locationId
 * @desc    Get emergency contacts for location
 * @access  Private - LOCATION_MANAGER, ADMIN, STAFF
 */
router.get(
    '/location/:locationId',
    authenticate,
    authorize([UserRole.LOCATION_MANAGER, UserRole.ADMIN]),
    validate([
        param('locationId').notEmpty().withMessage('Location ID is required'),
        query('status').optional().isIn(['VERIFIED', 'UNVERIFIED', 'INACTIVE']).withMessage('Invalid status'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
        query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
    ]),
    async (req: Request, res: Response) => {
        try {
            const result = await controller.getLocationEmergencyContacts(
                req.params.locationId,
                req.query
            );
            res.json(result);
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to retrieve emergency contacts',
                error: error.message
            });
        }
    }
);

/**
 * @route   GET /api/v1/emergency-contacts/student/:studentId
 * @desc    Get emergency contacts for student
 * @access  Private - LOCATION_MANAGER, ADMIN, STAFF, PARENT
 */
router.get(
    '/student/:studentId',
    authenticate,
    authorize([UserRole.LOCATION_MANAGER, UserRole.ADMIN, UserRole.PARENT]),
    validate([
        param('studentId').notEmpty().withMessage('Student ID is required'),
    ]),
    async (req: Request, res: Response) => {
        try {
            const result = await controller.getStudentEmergencyContacts(req.params.studentId);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to retrieve student emergency contacts',
                error: error.message
            });
        }
    }
);

/**
 * @route   PUT /api/v1/emergency-contacts/:id
 * @desc    Update emergency contact
 * @access  Private - LOCATION_MANAGER, ADMIN, PARENT
 */
router.put(
    '/:id',
    authenticate,
    authorize([UserRole.LOCATION_MANAGER, UserRole.ADMIN, UserRole.PARENT]),
    validate([
        param('id').notEmpty().withMessage('Contact ID is required'),
        body('name').optional().notEmpty().withMessage('Contact name cannot be empty'),
        body('relationship').optional().notEmpty().withMessage('Relationship cannot be empty'),
        body('phone').optional().notEmpty().withMessage('Phone number cannot be empty'),
        body('email').optional().isEmail().withMessage('Valid email is required'),
    ]),
    async (req: Request, res: Response) => {
        try {
            const result = await controller.updateEmergencyContact(
                req.params.id,
                req.body,
                req
            );
            res.json(result);
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update emergency contact',
                error: error.message
            });
        }
    }
);

/**
 * @route   PUT /api/v1/emergency-contacts/:id/verify
 * @desc    Verify emergency contact
 * @access  Private - LOCATION_MANAGER, ADMIN
 */
router.put(
    '/:id/verify',
    authenticate,
    authorize([UserRole.LOCATION_MANAGER, UserRole.ADMIN]),
    validate([
        param('id').notEmpty().withMessage('Contact ID is required'),
    ]),
    async (req: Request, res: Response) => {
        try {
            const result = await controller.verifyContact(req.params.id, req);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to verify emergency contact',
                error: error.message
            });
        }
    }
);

/**
 * @route   DELETE /api/v1/emergency-contacts/:id
 * @desc    Delete emergency contact
 * @access  Private - LOCATION_MANAGER, ADMIN, PARENT
 */
router.delete(
    '/:id',
    authenticate,
    authorize([UserRole.LOCATION_MANAGER, UserRole.ADMIN, UserRole.PARENT]),
    validate([
        param('id').notEmpty().withMessage('Contact ID is required'),
    ]),
    async (req: Request, res: Response) => {
        try {
            const result = await controller.deleteEmergencyContact(req.params.id);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to delete emergency contact',
                error: error.message
            });
        }
    }
);

export default router;
