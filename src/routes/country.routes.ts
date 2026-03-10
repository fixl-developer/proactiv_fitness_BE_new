import { Router } from 'express';
import countryController from '../controllers/country.controller';
import { authenticate, authorize } from '../modules/iam/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserRole } from '../shared/enums';
import { createCountryValidation, updateCountryValidation, idParamValidation } from '../modules/bcms/bcms.validation';

const router = Router();

router.use(authenticate);

router.post(
    '/',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN),
    validate(createCountryValidation),
    countryController.create.bind(countryController)
);

router.get(
    '/',
    countryController.getAll.bind(countryController)
);

router.get(
    '/:id',
    validate(idParamValidation),
    countryController.getById.bind(countryController)
);

router.put(
    '/:id',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN),
    validate(updateCountryValidation),
    countryController.update.bind(countryController)
);

router.delete(
    '/:id',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN),
    validate(idParamValidation),
    countryController.delete.bind(countryController)
);

export default router;