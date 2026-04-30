import { Router } from 'express';
import holidayCalendarController from '../controllers/holiday-calendar.controller';
import { authenticate, authorize } from '../modules/iam/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserRole } from '../shared/enums';
import { createHolidayCalendarValidation, updateHolidayCalendarValidation, idParamValidation } from '../modules/bcms/bcms.validation';

const router = Router();

router.use(authenticate);

router.post(
    '/',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    validate(createHolidayCalendarValidation),
    holidayCalendarController.create.bind(holidayCalendarController)
);

router.get(
    '/',
    holidayCalendarController.getAll.bind(holidayCalendarController)
);

router.get(
    '/:id',
    validate(idParamValidation),
    holidayCalendarController.getById.bind(holidayCalendarController)
);

router.put(
    '/:id',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    validate(updateHolidayCalendarValidation),
    holidayCalendarController.update.bind(holidayCalendarController)
);

router.delete(
    '/:id',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    validate(idParamValidation),
    holidayCalendarController.delete.bind(holidayCalendarController)
);

export default router;