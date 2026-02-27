import { Router } from 'express';
import businessUnitController from '../controllers/business-unit.controller';
import { authenticate, authorize } from '../modules/iam/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserRole } from '../shared/enums';
import { createBusinessUnitValidation, updateBusinessUnitValidation, idParamValidation } from '../modules/bcms/bcms.validation';

const router = Router();

router.use(authenticate);

router.post(
    '/',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN),
    validate(createBusinessUnitValidation),
    businessUnitController.wrap(businessUnitController.create)
);

router.get(
    '/',
    businessUnitController.wrap(businessUnitController.getAll)
);

router.get(
    '/:id',
    validate(idParamValidation),
    businessUnitController.wrap(businessUnitController.getById)
);

router.put(
    '/:id',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN),
    validate(updateBusinessUnitValidation),
    businessUnitController.wrap(businessUnitController.update)
);

router.delete(
    '/:id',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN),
    validate(idParamValidation),
    businessUnitController.wrap(businessUnitController.delete)
);

export default router;