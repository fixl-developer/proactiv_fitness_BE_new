import { Router } from 'express';
import roomController from './room.controller';
import { authenticate, authorize } from '@modules/iam/auth.middleware';
import { validate } from '@middleware/validation.middleware';
import { UserRole } from '@shared/enums';
import { createRoomValidation, updateRoomValidation, idParamValidation } from './bcms.validation';

const router = Router();

router.use(authenticate);

router.post(
    '/',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN, UserRole.LOCATION_MANAGER),
    validate(createRoomValidation),
    roomController.wrap(roomController.create)
);

router.get(
    '/',
    roomController.wrap(roomController.getAll)
);

router.get(
    '/:id',
    validate(idParamValidation),
    roomController.wrap(roomController.getById)
);

router.put(
    '/:id',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN, UserRole.LOCATION_MANAGER),
    validate(updateRoomValidation),
    roomController.wrap(roomController.update)
);

router.delete(
    '/:id',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN, UserRole.LOCATION_MANAGER),
    validate(idParamValidation),
    roomController.wrap(roomController.delete)
);

export default router;
