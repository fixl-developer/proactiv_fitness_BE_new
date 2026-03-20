import { Router } from 'express';
import holidayCalendarController from './holiday-calendar.controller';
import { authenticate, authorize } from '@modules/iam/auth.middleware';
import { validate } from '@middleware/validation.middleware';
import { UserRole } from '@shared/enums';
import { asyncHandler } from '@shared/utils/async-handler.util';
import { createHolidayCalendarValidation, updateHolidayCalendarValidation, idParamValidation } from './bcms.validation';

const router = Router();

router.use(authenticate);

router.post(
    '/',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    validate(createHolidayCalendarValidation),
    asyncHandler((req, res) => holidayCalendarController.create(req, res))
);

router.get(
    '/',
    asyncHandler((req, res) => holidayCalendarController.getAll(req, res))
);

router.get(
    '/:id',
    validate(idParamValidation),
    asyncHandler((req, res) => holidayCalendarController.getById(req, res))
);

router.put(
    '/:id',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    validate(updateHolidayCalendarValidation),
    asyncHandler((req, res) => holidayCalendarController.update(req, res))
);

router.delete(
    '/:id',
    authorize(UserRole.ADMIN),
    validate(idParamValidation),
    asyncHandler((req, res) => holidayCalendarController.delete(req, res))
);

export default router;
