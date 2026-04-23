import { Router } from 'express';
import { authenticate, authorize } from '@modules/iam/auth.middleware';
import { UserRole } from '@shared/enums';
import { notificationTemplateController } from './notification-template.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Stats must be before /:id to avoid matching "stats" as an id
router.get(
    '/stats',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    notificationTemplateController.getStats.bind(notificationTemplateController)
);

router.get(
    '/',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    notificationTemplateController.getAll.bind(notificationTemplateController)
);

router.get(
    '/:id',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    notificationTemplateController.getById.bind(notificationTemplateController)
);

router.post(
    '/',
    authorize(UserRole.ADMIN),
    notificationTemplateController.create.bind(notificationTemplateController)
);

router.put(
    '/:id',
    authorize(UserRole.ADMIN),
    notificationTemplateController.update.bind(notificationTemplateController)
);

router.delete(
    '/:id',
    authorize(UserRole.ADMIN),
    notificationTemplateController.delete.bind(notificationTemplateController)
);

router.post(
    '/:id/duplicate',
    authorize(UserRole.ADMIN),
    notificationTemplateController.duplicate.bind(notificationTemplateController)
);

export { router as notificationTemplateRoutes };
