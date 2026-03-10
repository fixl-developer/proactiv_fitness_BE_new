import { Router } from 'express';
import roomController from '../controllers/room.controller';
import { authenticate, authorize } from '../modules/iam/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserRole } from '../shared/enums';
import { createRoomValidation, updateRoomValidation, idParamValidation } from '../modules/bcms/bcms.validation';

const router = Router();

router.use(authenticate);

router.post(
    '/',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN, UserRole.FRANCHISE_OWNER, UserRole.LOCATION_MANAGER),
    validate(createRoomValidation),
    roomController.create.bind(roomController)
);

router.get(
    '/',
    roomController.getAll.bind(roomController)
);

router.get(
    '/:id',
    validate(idParamValidation),
    roomController.getById.bind(roomController)
);

router.put(
    '/:id',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN, UserRole.FRANCHISE_OWNER, UserRole.LOCATION_MANAGER),
    validate(updateRoomValidation),
    roomController.update.bind(roomController)
);

router.delete(
    '/:id',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN, UserRole.FRANCHISE_OWNER),
    validate(idParamValidation),
    roomController.delete.bind(roomController)
);

export default router;