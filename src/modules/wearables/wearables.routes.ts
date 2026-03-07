import { Router } from 'express';
import { wearablesController } from './wearables.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.post('/connect', wearablesController.connectDevice.bind(wearablesController));
router.get('/devices/:userId', wearablesController.getDevices.bind(wearablesController));
router.post('/sync', wearablesController.syncData.bind(wearablesController));
router.get('/metrics/:userId', wearablesController.getMetrics.bind(wearablesController));
router.post('/workout-log', wearablesController.logWorkout.bind(wearablesController));
router.get('/heart-rate/:userId', wearablesController.getHeartRate.bind(wearablesController));
router.get('/sleep/:userId', wearablesController.getSleep.bind(wearablesController));
router.post('/geofence-checkin', wearablesController.geofenceCheckin.bind(wearablesController));

export default router;
