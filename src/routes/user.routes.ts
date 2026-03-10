import { Router } from 'express';
import userController from '../controllers/user.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate, authorize, checkOwnership } from '../modules/iam/auth.middleware';
import { UserRole } from '../shared/enums';
import {
    createUserValidation,
    updateUserValidation,
    updateUserStatusValidation,
    getUsersQueryValidation,
    idParamValidation,
} from '../modules/iam/user.validation';

const router = Router();

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
    userController.updateProfile.bind(userController)
);

// Admin routes
router.post(
    '/',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN),
    validate(createUserValidation),
    userController.create.bind(userController)
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
    validate(updateUserValidation),
    checkOwnership('id'),
    userController.update.bind(userController)
);

router.delete(
    '/:id',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN),
    validate(idParamValidation),
    userController.delete.bind(userController)
);

router.patch(
    '/:id/status',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN),
    validate(updateUserStatusValidation),
    userController.updateStatus.bind(userController)
);

export default router;