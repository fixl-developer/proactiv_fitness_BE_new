import { Router } from 'express';
import locationController from '../controllers/location.controller';
import { authenticate, authorize } from '../modules/iam/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserRole } from '../shared/enums';
import { createLocationValidation, updateLocationValidation, idParamValidation } from '../modules/bcms/bcms.validation';

const router = Router();

router.use(authenticate);

router.post(
    '/',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN, UserRole.FRANCHISE_OWNER),
    validate(createLocationValidation),
    locationController.create.bind(locationController)
);

router.get(
    '/',
    locationController.getAll.bind(locationController)
);

router.get(
    '/:id',
    validate(idParamValidation),
    locationController.getById.bind(locationController)
);

router.put(
    '/:id',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN, UserRole.FRANCHISE_OWNER, UserRole.LOCATION_MANAGER),
    validate(updateLocationValidation),
    locationController.update.bind(locationController)
);

router.delete(
    '/:id',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN),
    validate(idParamValidation),
    locationController.delete.bind(locationController)
);

export default router;