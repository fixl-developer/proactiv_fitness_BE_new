import { Router } from 'express';
import { CapacityOptimizerController } from './capacity.controller';

const router = Router();
const controller = new CapacityOptimizerController();

router.post('/monitor', controller.monitorCapacity);
router.post('/rebalance', controller.executeRebalance);
router.get('/summary/:locationId', controller.getCapacitySummary);

export default router;
