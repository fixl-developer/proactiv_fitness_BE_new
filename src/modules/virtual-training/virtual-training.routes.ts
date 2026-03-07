import { Router } from 'express';
import { VirtualTrainingController } from './virtual-training.controller';

const router = Router();
const controller = new VirtualTrainingController();

router.post('/sessions', controller.createSession);
router.get('/sessions', controller.getSessions);
router.get('/sessions/:id', controller.getSessionById);
router.put('/sessions/:id', controller.updateSession);
router.post('/sessions/:id/join', controller.joinSession);

export default router;
