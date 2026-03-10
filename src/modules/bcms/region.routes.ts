import { Router } from 'express';
import regionController from './region.controller';
import { authenticate, authorize } from '@modules/iam/auth.middleware';
import { validate } from '@middleware/validation.middleware';
import { UserRole } from '@shared/enums';
import { createRegionValidation, updateRegionValidation, idParamValidation } from './bcms.validation';

const router = Router();

router.use(authenticate);

router.post(
    '/',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN),
    validate(createRegionValidation),
    regionController.create
);

router.get(
    '/',
    regionController.getAll
);

router.get(
    '/:id',
    validate(idParamValidation),
    regionController.getById
);

router.put(
    '/:id',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN),
    validate(updateRegionValidation),
    regionController.update
);

router.delete(
    '/:id',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN),
    validate(idParamValidation),
    regionController.delete
);

export default router;
