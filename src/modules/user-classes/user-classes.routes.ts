import { Router } from 'express';
import { userClassesController } from './user-classes.controller';
import { authMiddleware } from '../iam/auth.middleware';

const router = Router();

router.get('/classes', authMiddleware, (req, res) => userClassesController.getMyClasses(req, res));
router.get('/classes/active', authMiddleware, (req, res) => userClassesController.getActiveClasses(req, res));
router.get('/classes/completed', authMiddleware, (req, res) => userClassesController.getCompletedClasses(req, res));
router.get('/classes/:classId', authMiddleware, (req, res) => userClassesController.getClassDetails(req, res));
router.get('/classes/:classId/attendance', authMiddleware, (req, res) => userClassesController.getClassAttendance(req, res));
router.post('/classes/:classId/feedback', authMiddleware, (req, res) => userClassesController.submitFeedback(req, res));

export default router;
