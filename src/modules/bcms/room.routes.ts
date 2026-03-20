import { Router } from 'express';
import roomController from './room.controller';
import { authenticate, authorize } from '@modules/iam/auth.middleware';
import { validate } from '@middleware/validation.middleware';
import { UserRole } from '@shared/enums';
import { asyncHandler } from '@shared/utils/async-handler.util';
import { createRoomValidation, updateRoomValidation, idParamValidation } from './bcms.validation';

const router = Router();

router.use(authenticate);

router.post(
    '/',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN, UserRole.LOCATION_MANAGER),
    validate(createRoomValidation),
    asyncHandler((req, res) => roomController.create(req, res))
);

router.get(
    '/',
    asyncHandler((req, res) => roomController.getAll(req, res))
);

router.get(
    '/:id',
    validate(idParamValidation),
    asyncHandler((req, res) => roomController.getById(req, res))
);

router.put(
    '/:id',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN, UserRole.LOCATION_MANAGER),
    validate(updateRoomValidation),
    asyncHandler((req, res) => roomController.update(req, res))
);

router.delete(
    '/:id',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN, UserRole.LOCATION_MANAGER),
    validate(idParamValidation),
    asyncHandler((req, res) => roomController.delete(req, res))
);

export default router;
