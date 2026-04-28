import { Router } from 'express';
import countryController from './country.controller';
import { authenticate, authorize } from '@modules/iam/auth.middleware';
import { validate } from '@middleware/validation.middleware';
import { UserRole } from '@shared/enums';
import { asyncHandler } from '@shared/utils/async-handler.util';
import { createCountryValidation, updateCountryValidation, idParamValidation } from './bcms.validation';

const router = Router();

router.use(authenticate);

router.post(
    '/',
    authorize(UserRole.ADMIN),
    validate(createCountryValidation),
    asyncHandler((req, res) => countryController.create(req, res))
);

router.get(
    '/',
    asyncHandler((req, res) => countryController.getAll(req, res))
);

router.get(
    '/:id',
    validate(idParamValidation),
    asyncHandler((req, res) => countryController.getById(req, res))
);

router.put(
    '/:id',
    authorize(UserRole.ADMIN),
    validate(updateCountryValidation),
    asyncHandler((req, res) => countryController.update(req, res))
);

router.delete(
    '/:id',
    authorize(UserRole.ADMIN),
    validate(idParamValidation),
    asyncHandler((req, res) => countryController.delete(req, res))
);

export default router;
