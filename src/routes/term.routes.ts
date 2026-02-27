import { Router } from 'express';
import termController from '../controllers/term.controller';
import { authenticate, authorize } from '../modules/iam/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserRole } from '../shared/enums';
import { createTermValidation, updateTermValidation, idParamValidation } from '../modules/bcms/bcms.validation';

const router = Router();

router.use(authenticate);

router.post(
    '/',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN, UserRole.FRANCHISE_OWNER, UserRole.LOCATION_MANAGER),
    validate(createTermValidation),
    termController.wrap(termController.create)
);

router.get(
    '/',
    termController.wrap(termController.getAll)
);

router.get(
    '/:id',
    validate(idParamValidation),
    termController.wrap(termController.getById)
);

router.put(
    '/:id',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN, UserRole.FRANCHISE_OWNER, UserRole.LOCATION_MANAGER),
    validate(updateTermValidation),
    termController.wrap(termController.update)
);

router.delete(
    '/:id',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN, UserRole.FRANCHISE_OWNER),
    validate(idParamValidation),
    termController.wrap(termController.delete)
);

export default router;