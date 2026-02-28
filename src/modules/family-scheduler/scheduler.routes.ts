import { Router } from 'express';
import { FamilySchedulerController } from './scheduler.controller';

const router = Router();
const controller = new FamilySchedulerController();

router.post('/optimize', controller.optimizeSchedule);
router.get('/:familyId', controller.getSchedule);

export default router;
