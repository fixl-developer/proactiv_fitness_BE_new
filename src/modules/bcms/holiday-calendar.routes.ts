import { Router } from 'express';
import holidayCalendarController from './holiday-calendar.controller';
import { authenticate, authorize } from '@modules/iam/auth.middleware';
import { validate } from '@middleware/validation.middleware';
import { UserRole } from '@shared/enums';
import { createHolidayCalendarValidation, updateHolidayCalendarValidation, idParamValidation } from './bcms.validation';

const router = Router();

router.use(authenticate);

router.post(
    '/',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN),
    validate(createHolidayCalendarValidation),
    holidayCalendarController.wrap(holidayCalendarController.create)
);

router.get(
    '/',
    holidayCalendarController.wrap(holidayCalendarController.getAll)
);

router.get(
    '/:id',
    validate(idParamValidation),
    holidayCalendarController.wrap(holidayCalendarController.getById)
);

router.put(
    '/:id',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN),
    validate(updateHolidayCalendarValidation),
    holidayCalendarController.wrap(holidayCalendarController.update)
);

router.delete(
    '/:id',
    authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN),
    validate(idParamValidation),
    holidayCalendarController.wrap(holidayCalendarController.delete)
);

export default router;
