import { Router } from 'express';
import countryController from './country.controller';
import { authenticate, authorize } from '@modules/iam/auth.middleware';
import { validate } from '@middleware/validation.middleware';
import { UserRole } from '@shared/enums';
import { createCountryValidation, updateCountryValidation, idParamValidation } from './bcms.validation';

const router = Router();

router.use(authenticate);

router.post(
    '/',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN),
    validate(createCountryValidation),
    countryController.create
);

router.get(
    '/',
    countryController.getAll
);

router.get(
    '/:id',
    validate(idParamValidation),
    countryController.getById
);

router.put(
    '/:id',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN),
    validate(updateCountryValidation),
    countryController.update
);

router.delete(
    '/:id',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN),
    validate(idParamValidation),
    countryController.delete
);

export default router;
