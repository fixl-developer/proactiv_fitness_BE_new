import { Router } from 'express';
import parentEngagementController from './parent-engagement.controller';

const router = Router();

router.use('/', parentEngagementController);

export default router;
