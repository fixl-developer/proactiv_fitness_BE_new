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
    locationController.wrap(locationController.create)
);

router.get(
    '/',
    locationController.wrap(locationController.getAll)
);

router.get(
    '/:id',
    validate(idParamValidation),
    locationController.wrap(locationController.getById)
);

router.put(
    '/:id',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN, UserRole.FRANCHISE_OWNER, UserRole.LOCATION_MANAGER),
    validate(updateLocationValidation),
    locationController.wrap(locationController.update)
);

router.delete(
    '/:id',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN),
    validate(idParamValidation),
    locationController.wrap(locationController.delete)
);

export default router;