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
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    validate(createRegionValidation),
    regionController.create.bind(regionController)
);

router.get(
    '/',
    regionController.getAll.bind(regionController)
);

router.get(
    '/:id',
    validate(idParamValidation),
    regionController.getById.bind(regionController)
);

router.put(
    '/:id',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    validate(updateRegionValidation),
    regionController.update.bind(regionController)
);

router.delete(
    '/:id',
    authorize(UserRole.ADMIN),
    validate(idParamValidation),
    regionController.delete.bind(regionController)
);

export default router;