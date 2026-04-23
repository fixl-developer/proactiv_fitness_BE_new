import { Router } from 'express';
import userController from './user.controller';
import { validate } from '@middleware/validation.middleware';
import { authenticate, authorize, checkOwnership, scopeFilter } from './auth.middleware';
import { canCreateRole, canDeleteUser, canUpdateUserStatus, canUpdateUser, canViewUsers, validateLocationScope } from './rbac.middleware';
import { auditLog } from './audit.middleware';
import { sanitizeInput } from './security.middleware';
import { UserRole } from '@shared/enums';
import {
    createUserValidation,
    updateUserValidation,
    updateUserStatusValidation,
    getUsersQueryValidation,
    idParamValidation,
} from './user.validation';

const router = Router();

// Sanitize all incoming request bodies
router.use(sanitizeInput());

// All routes require authentication
router.use(authenticate);

// User profile routes (accessible by the user themselves)
router.get(
    '/profile',
    userController.getProfile.bind(userController)
);

router.put(
    '/profile',
    validate(updateUserValidation),
    auditLog('USER_PROFILE_UPDATE', 'User'),
    userController.updateProfile.bind(userController)
);

// Create user - roles that can create others + RBAC hierarchy check
router.post(
    '/',
    authorize(
        UserRole.ADMIN,
        UserRole.REGIONAL_ADMIN,
        UserRole.FRANCHISE_OWNER,
        UserRole.LOCATION_MANAGER
    ),
    validate(createUserValidation),
    canCreateRole(),
    validateLocationScope(),
    auditLog('USER_CREATE', 'User'),
    userController.create.bind(userController)
);

// Get all users - scoped by role with scopeFilter + canViewUsers
router.get(
    '/',
    authorize(
        UserRole.ADMIN,
        UserRole.REGIONAL_ADMIN,
        UserRole.FRANCHISE_OWNER,
        UserRole.LOCATION_MANAGER
    ),
    validate(getUsersQueryValidation),
    scopeFilter(),
    canViewUsers(),
    userController.getAll.bind(userController)
);

router.get(
    '/:id',
    validate(idParamValidation),
    checkOwnership('id'),
    userController.getById.bind(userController)
);

router.put(
    '/:id',
    authorize(
        UserRole.ADMIN,
        UserRole.REGIONAL_ADMIN,
        UserRole.FRANCHISE_OWNER,
        UserRole.LOCATION_MANAGER
    ),
    validate(updateUserValidation),
    canUpdateUser(),
    auditLog('USER_UPDATE', 'User'),
    userController.update.bind(userController)
);

// Delete user - roles that can delete + RBAC hierarchy check
router.delete(
    '/:id',
    authorize(
        UserRole.ADMIN,
        UserRole.REGIONAL_ADMIN,
        UserRole.FRANCHISE_OWNER,
        UserRole.LOCATION_MANAGER
    ),
    validate(idParamValidation),
    canDeleteUser(),
    auditLog('USER_DELETE', 'User'),
    userController.delete.bind(userController)
);

// Update user status - roles that can update status + RBAC hierarchy check
router.patch(
    '/:id/status',
    authorize(
        UserRole.ADMIN,
        UserRole.REGIONAL_ADMIN,
        UserRole.FRANCHISE_OWNER,
        UserRole.LOCATION_MANAGER
    ),
    validate(updateUserStatusValidation),
    canUpdateUserStatus(),
    auditLog('USER_STATUS_CHANGE', 'User'),
    userController.updateStatus.bind(userController)
);

export default router;
