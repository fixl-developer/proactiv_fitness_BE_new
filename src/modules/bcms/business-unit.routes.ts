import { Router } from 'express';
import businessUnitController from './business-unit.controller';
import { authenticate, authorize } from '@modules/iam/auth.middleware';
import { validate } from '@middleware/validation.middleware';
import { UserRole } from '@shared/enums';
import { asyncHandler } from '@shared/utils/async-handler.util';
import { createBusinessUnitValidation, updateBusinessUnitValidation, idParamValidation } from './bcms.validation';

const router = Router();

router.use(authenticate);

router.post(
    '/',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    validate(createBusinessUnitValidation),
    asyncHandler((req, res) => businessUnitController.create(req, res))
);

router.get(
    '/',
    asyncHandler((req, res) => businessUnitController.getAll(req, res))
);

router.get(
    '/:id',
    validate(idParamValidation),
    asyncHandler((req, res) => businessUnitController.getById(req, res))
);

router.put(
    '/:id',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    validate(updateBusinessUnitValidation),
    asyncHandler((req, res) => businessUnitController.update(req, res))
);

router.delete(
    '/:id',
    authorize(UserRole.ADMIN),
    validate(idParamValidation),
    asyncHandler((req, res) => businessUnitController.delete(req, res))
);

export default router;
