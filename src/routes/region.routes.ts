import { Router } from 'express';
import regionController from '../controllers/region.controller';
import { authenticate, authorize } from '../modules/iam/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserRole } from '../shared/enums';
import { createRegionValidation, updateRegionValidation, idParamValidation } from '../modules/bcms/bcms.validation';

const router = Router();

router.use(authenticate);

router.post(
    '/',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN),
    validate(createRegionValidation),
    regionController.wrap(regionController.create)
);

router.get(
    '/',
    regionController.wrap(regionController.getAll)
);

router.get(
    '/:id',
    validate(idParamValidation),
    regionController.wrap(regionController.getById)
);

router.put(
    '/:id',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN),
    validate(updateRegionValidation),
    regionController.wrap(regionController.update)
);

router.delete(
    '/:id',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN),
    validate(idParamValidation),
    regionController.wrap(regionController.delete)
);

export default router;