import { Router } from 'express';
import advancedAnalyticsController from './advanced-analytics.controller';

const router = Router();

router.use('/advanced-analytics', advancedAnalyticsController);

export default router;
