import { Router } from 'express';
import userController from './user.controller';
import { validate } from '@middleware/validation.middleware';
import { authenticate, authorize, checkOwnership } from './auth.middleware';
import { UserRole } from '@shared/enums';
import {
    createUserValidation,
    updateUserValidation,
    updateUserStatusValidation,
    getUsersQueryValidation,
    idParamValidation,
} from './user.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// User profile routes (accessible by the user themselves)
router.get(
    '/profile',
    userController.wrap(userController.getProfile)
);

router.put(
    '/profile',
    validate(updateUserValidation),
    userController.wrap(userController.updateProfile)
);

// Admin routes
router.post(
    '/',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN),
    validate(createUserValidation),
    userController.wrap(userController.create)
);

router.get(
    '/',
    authorize(
        UserRole.SUPER_ADMIN,
        UserRole.HQ_ADMIN,
        UserRole.REGIONAL_ADMIN,
        UserRole.LOCATION_MANAGER
    ),
    validate(getUsersQueryValidation),
    userController.wrap(userController.getAll)
);

router.get(
    '/:id',
    validate(idParamValidation),
    checkOwnership('id'),
    userController.wrap(userController.getById)
);

router.put(
    '/:id',
    validate(updateUserValidation),
    checkOwnership('id'),
    userController.wrap(userController.update)
);

router.delete(
    '/:id',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN),
    validate(idParamValidation),
    userController.wrap(userController.delete)
);

router.patch(
    '/:id/status',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN),
    validate(updateUserStatusValidation),
    userController.wrap(userController.updateStatus)
);

export default router;
