import { Router } from 'express';
import locationController from './location.controller';
import { authenticate, authorize } from '@modules/iam/auth.middleware';
import { validate } from '@middleware/validation.middleware';
import { UserRole } from '@shared/enums';
import { asyncHandler } from '@shared/utils/async-handler.util';
import { createLocationValidation, updateLocationValidation, idParamValidation } from './bcms.validation';

const router = Router();

router.use(authenticate);

router.post(
    '/',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    validate(createLocationValidation),
    asyncHandler((req, res) => locationController.create(req, res))
);

router.get(
    '/',
    asyncHandler((req, res) => locationController.getAll(req, res))
);

router.get(
    '/:id',
    validate(idParamValidation),
    asyncHandler((req, res) => locationController.getById(req, res))
);

router.put(
    '/:id',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN, UserRole.LOCATION_MANAGER),
    validate(updateLocationValidation),
    asyncHandler((req, res) => locationController.update(req, res))
);

router.delete(
    '/:id',
    authorize(UserRole.ADMIN),
    validate(idParamValidation),
    asyncHandler((req, res) => locationController.delete(req, res))
);

export default router;
