import { Router } from 'express';
import notificationController from './notifications.controller';

const router = Router();

router.use('/notifications', notificationController);

export default router;
