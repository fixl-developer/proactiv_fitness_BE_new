import { Router } from 'express';
import aiSafetyMonitorController from './ai-safety-monitor.controller';

const router = Router();

router.use('/ai-safety-monitor', aiSafetyMonitorController);

export default router;
