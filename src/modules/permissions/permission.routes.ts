import { Router } from 'express';
import { PermissionController } from './permission.controller';
import { authenticate, authorize } from '../iam/auth.middleware';
import { body, param, query } from 'express-validator';

// Helper function for validation
const validate = (validations: any[]) => {
    return async (req: any, res: any, next: any) => {
        for (const validation of validations) {
            const result = await validation.run(req);
            if (!result.isEmpty()) {
                return res.status(400).json({ errors: result.array() });
            }
        }
        next();
    };
};

const router = Router();

// Validation middleware
const createPermissionValidation = [
    body('name')
        .notEmpty()
        .withMessage('Permission name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Permission name must be between 2 and 100 characters'),
    body('module')
        .notEmpty()
        .withMessage('Module is required')
        .isIn(['users', 'roles', 'permissions', 'cms', 'bookings', 'payments', 'reports', 'settings', 'locations', 'staff', 'students', 'parents'])
        .withMessage('Invalid module'),
    body('action')
        .notEmpty()
        .withMessage('Action is required')
        .isIn(['view', 'create', 'edit', 'delete', 'manage', 'approve', 'export'])
        .withMessage('Invalid action'),
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    body('resourceType')
        .optional()
        .isIn(['User', 'Role', 'Permission', 'Booking', 'Payment', 'Report', 'Location', 'Staff', 'Student', 'Parent', 'Program', 'Schedule', 'Class', 'Session'])
        .withMessage('Invalid resource type'),
    body('status')
        .optional()
        .isIn(['active', 'inactive', 'deprecated'])
        .withMessage('Invalid status'),
    body('isSystemPermission')
        .optional()
        .isBoolean()
        .withMessage('isSystemPermission must be a boolean'),
];

const updatePermissionValidation = [
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    body('resourceType')
        .optional()
        .isIn(['User', 'Role', 'Permission', 'Booking', 'Payment', 'Report', 'Location', 'Staff', 'Student', 'Parent', 'Program', 'Schedule', 'Class', 'Session'])
        .withMessage('Invalid resource type'),
    body('status')
        .optional()
        .isIn(['active', 'inactive', 'deprecated'])
        .withMessage('Invalid status'),
];

const getPermissionsQueryValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('search')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Search term cannot exceed 100 characters'),
    query('module')
        .optional()
        .isIn(['users', 'roles', 'permissions', 'cms', 'bookings', 'payments', 'reports', 'settings', 'locations', 'staff', 'students', 'parents'])
        .withMessage('Invalid module'),
    query('status')
        .optional()
        .isIn(['active', 'inactive', 'deprecated'])
        .withMessage('Invalid status'),
    query('resourceType')
        .optional()
        .isIn(['User', 'Role', 'Permission', 'Booking', 'Payment', 'Report', 'Location', 'Staff', 'Student', 'Parent', 'Program', 'Schedule', 'Class', 'Session'])
        .withMessage('Invalid resource type'),
];

const idParamValidation = [
    param('id')
        .isMongoId()
        .withMessage('Invalid permission ID'),
];

// Routes
// Create permission
router.post(
    '/',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    validate(createPermissionValidation),
    PermissionController.create
);

// Get all permissions
router.get(
    '/',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    validate(getPermissionsQueryValidation),
    PermissionController.getAll
);

// Get permission by ID
router.get(
    '/:id',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    validate(idParamValidation),
    PermissionController.getById
);

// Get permissions by module
router.get(
    '/module/:module',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    PermissionController.getByModule
);

// Update permission
router.put(
    '/:id',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    validate([...idParamValidation, ...updatePermissionValidation]),
    PermissionController.update
);

// Delete permission
router.delete(
    '/:id',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    validate(idParamValidation),
    PermissionController.delete
);

// Get active permissions
router.get(
    '/status/active',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    PermissionController.getActive
);

// Bulk update status
router.patch(
    '/bulk/status',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    validate([
        body('ids')
            .isArray({ min: 1 })
            .withMessage('IDs must be a non-empty array'),
        body('status')
            .notEmpty()
            .withMessage('Status is required')
            .isIn(['active', 'inactive', 'deprecated'])
            .withMessage('Invalid status'),
    ]),
    PermissionController.bulkUpdateStatus
);

export default router;
