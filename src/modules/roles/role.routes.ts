import { Router } from 'express';
import { RoleController } from './role.controller';
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
const createRoleValidation = [
    body('name')
        .notEmpty()
        .withMessage('Role name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Role name must be between 2 and 100 characters'),
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    body('permissions')
        .optional()
        .isArray()
        .withMessage('Permissions must be an array'),
    body('roleType')
        .optional()
        .isIn(['admin', 'manager', 'staff', 'user', 'custom'])
        .withMessage('Invalid role type'),
    body('status')
        .optional()
        .isIn(['active', 'inactive', 'deprecated'])
        .withMessage('Invalid status'),
    body('assignedLocations')
        .optional()
        .isArray()
        .withMessage('Assigned locations must be an array'),
    body('assignedBusinessUnits')
        .optional()
        .isArray()
        .withMessage('Assigned business units must be an array'),
];

const updateRoleValidation = [
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    body('permissions')
        .optional()
        .isArray()
        .withMessage('Permissions must be an array'),
    body('roleType')
        .optional()
        .isIn(['admin', 'manager', 'staff', 'user', 'custom'])
        .withMessage('Invalid role type'),
    body('status')
        .optional()
        .isIn(['active', 'inactive', 'deprecated'])
        .withMessage('Invalid status'),
    body('assignedLocations')
        .optional()
        .isArray()
        .withMessage('Assigned locations must be an array'),
    body('assignedBusinessUnits')
        .optional()
        .isArray()
        .withMessage('Assigned business units must be an array'),
];

const getRolesQueryValidation = [
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
    query('status')
        .optional()
        .isIn(['active', 'inactive', 'deprecated'])
        .withMessage('Invalid status'),
    query('roleType')
        .optional()
        .isIn(['admin', 'manager', 'staff', 'user', 'custom'])
        .withMessage('Invalid role type'),
];

const idParamValidation = [
    param('id')
        .isMongoId()
        .withMessage('Invalid role ID'),
];

// Routes
// Create role
router.post(
    '/',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    validate(createRoleValidation),
    RoleController.create
);

// Get all roles
router.get(
    '/',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    validate(getRolesQueryValidation),
    RoleController.getAll
);

// Get role by ID
router.get(
    '/:id',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    validate(idParamValidation),
    RoleController.getById
);

// Update role
router.put(
    '/:id',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    validate([...idParamValidation, ...updateRoleValidation]),
    RoleController.update
);

// Delete role
router.delete(
    '/:id',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    validate(idParamValidation),
    RoleController.delete
);

// Get roles by type
router.get(
    '/type/:roleType',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    RoleController.getByType
);

// Get active roles
router.get(
    '/status/active',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    RoleController.getActive
);

// Add permission to role
router.post(
    '/:id/permissions',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    validate([
        ...idParamValidation,
        body('permissionName')
            .notEmpty()
            .withMessage('Permission name is required'),
    ]),
    RoleController.addPermission
);

// Remove permission from role
router.delete(
    '/:id/permissions/:permissionName',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    validate(idParamValidation),
    RoleController.removePermission
);

// Get roles by location
router.get(
    '/location/:locationId',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    RoleController.getByLocation
);

// Get roles by business unit
router.get(
    '/business-unit/:businessUnitId',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    RoleController.getByBusinessUnit
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
    RoleController.bulkUpdateStatus
);

export default router;
