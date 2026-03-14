import { Router } from 'express';
import virtualTrainingController from './virtual-training.controller';
import { authenticate } from '@/middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/classes', virtualTrainingController.getVirtualClasses);
router.post('/classes', virtualTrainingController.createVirtualClass);
router.get('/classes/:id', virtualTrainingController.getVirtualClassById);
router.put('/classes/:id', virtualTrainingController.updateVirtualClass);
router.post('/classes/:id/cancel', virtualTrainingController.cancelVirtualClass);
router.post('/classes/:id/join', virtualTrainingController.joinVirtualClass);
router.post('/classes/:id/leave', virtualTrainingController.leaveVirtualClass);

router.get('/recordings', virtualTrainingController.getRecordings);
router.get('/recordings/:id', virtualTrainingController.getRecordingById);

router.post('/classes/:id/chat', virtualTrainingController.sendMessage);
router.get('/classes/:id/chat', virtualTrainingController.getMessages);

router.get('/classes/:id/attendance', virtualTrainingController.getAttendance);

export default router;
