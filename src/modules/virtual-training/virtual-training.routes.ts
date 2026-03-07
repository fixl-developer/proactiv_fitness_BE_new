import { Router } from 'express';
import { virtualTrainingController } from './virtual-training.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.post('/sessions/create', virtualTrainingController.createSession.bind(virtualTrainingController));
router.post('/sessions/:id/start', virtualTrainingController.startSession.bind(virtualTrainingController));
router.post('/sessions/:id/end', virtualTrainingController.endSession.bind(virtualTrainingController));
router.post('/sessions/:id/join', virtualTrainingController.joinSession.bind(virtualTrainingController));
router.get('/library', virtualTrainingController.getLibrary.bind(virtualTrainingController));
router.post('/attendance', virtualTrainingController.trackAttendance.bind(virtualTrainingController));
router.get('/analytics/:sessionId', virtualTrainingController.getAnalytics.bind(virtualTrainingController));

export default router;
