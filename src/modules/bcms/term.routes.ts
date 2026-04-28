import { Router } from 'express';
import termController from './term.controller';
import { authenticate, authorize } from '@modules/iam/auth.middleware';
import { validate } from '@middleware/validation.middleware';
import { UserRole } from '@shared/enums';
import { asyncHandler } from '@shared/utils/async-handler.util';
import { createTermValidation, updateTermValidation, idParamValidation } from './bcms.validation';

const router = Router();

router.use(authenticate);

router.post(
    '/',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN, UserRole.LOCATION_MANAGER),
    validate(createTermValidation),
    asyncHandler((req, res) => termController.create(req, res))
);

router.get(
    '/',
    asyncHandler((req, res) => termController.getAll(req, res))
);

router.get(
    '/:id',
    validate(idParamValidation),
    asyncHandler((req, res) => termController.getById(req, res))
);

router.put(
    '/:id',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN, UserRole.LOCATION_MANAGER),
    validate(updateTermValidation),
    asyncHandler((req, res) => termController.update(req, res))
);

router.delete(
    '/:id',
    authorize(UserRole.ADMIN),
    validate(idParamValidation),
    asyncHandler((req, res) => termController.delete(req, res))
);

export default router;
