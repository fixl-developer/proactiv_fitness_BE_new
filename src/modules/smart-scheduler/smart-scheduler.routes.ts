import { Router } from 'express';
import smartSchedulerController from './smart-scheduler.controller';

const router = Router();

router.use('/smart-scheduler', smartSchedulerController);

export default router;
