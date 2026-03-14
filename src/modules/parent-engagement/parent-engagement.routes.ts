import { Router } from 'express';
import parentEngagementController from './parent-engagement.controller';

const router = Router();

router.use('/parent-engagement', parentEngagementController);

export default router;
