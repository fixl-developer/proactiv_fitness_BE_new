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
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    validate(createBusinessUnitValidation),
    businessUnitController.create.bind(businessUnitController)
);

router.get(
    '/',
    businessUnitController.getAll.bind(businessUnitController)
);

router.get(
    '/:id',
    validate(idParamValidation),
    businessUnitController.getById.bind(businessUnitController)
);

router.put(
    '/:id',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    validate(updateBusinessUnitValidation),
    businessUnitController.update.bind(businessUnitController)
);

router.delete(
    '/:id',
    authorize(UserRole.ADMIN),
    validate(idParamValidation),
    businessUnitController.delete.bind(businessUnitController)
);

export default router;