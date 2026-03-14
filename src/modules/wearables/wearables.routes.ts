import { Router } from 'express';
import wearablesController from './wearables.controller';
import { authenticate } from '@/middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/devices', wearablesController.getConnectedDevices);
router.post('/devices/connect', wearablesController.connectDevice);
router.post('/devices/:id/disconnect', wearablesController.disconnectDevice);
router.post('/devices/:id/sync', wearablesController.syncDevice);

router.get('/fitness-data', wearablesController.getFitnessData);
router.get('/fitness-data/today', wearablesController.getTodayStats);
router.get('/fitness-data/weekly', wearablesController.getWeeklyStats);
router.get('/fitness-data/monthly', wearablesController.getMonthlyStats);

router.post('/goals', wearablesController.setFitnessGoal);
router.get('/goals', wearablesController.getFitnessGoals);

router.get('/insights', wearablesController.getFitnessInsights);

export default router;
