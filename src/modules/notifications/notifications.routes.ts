import { Router } from 'express';
import notificationController from './notifications.controller';

const router = Router();

router.use('/', notificationController);

export default router;
