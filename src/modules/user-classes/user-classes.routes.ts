import { Router } from 'express';
import { userClassesController } from './user-classes.controller';
import { authMiddleware } from '../iam/auth.middleware';

const router = Router();

router.get('/', authMiddleware, (req, res) => userClassesController.getMyClasses(req, res));
router.get('/active', authMiddleware, (req, res) => userClassesController.getActiveClasses(req, res));
router.get('/completed', authMiddleware, (req, res) => userClassesController.getCompletedClasses(req, res));
router.get('/upcoming', authMiddleware, (req, res) => userClassesController.getUpcomingClasses(req, res));
router.get('/:classId', authMiddleware, (req, res) => userClassesController.getClassDetails(req, res));
router.get('/:classId/attendance', authMiddleware, (req, res) => userClassesController.getClassAttendance(req, res));
router.post('/:classId/feedback', authMiddleware, (req, res) => userClassesController.submitFeedback(req, res));

export default router;
