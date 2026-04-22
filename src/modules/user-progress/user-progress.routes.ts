import { Router } from 'express';
import { userProgressController } from './user-progress.controller';
import { authMiddleware } from '../iam/auth.middleware';

const router = Router();

router.get('/', authMiddleware, (req, res) => userProgressController.getProgress(req, res));
router.get('/timeline', authMiddleware, (req, res) => userProgressController.getTimeline(req, res));
router.get('/skills', authMiddleware, (req, res) => userProgressController.getSkillLevels(req, res));
router.get('/metrics', authMiddleware, (req, res) => userProgressController.getPerformanceMetrics(req, res));
router.post('/milestone', authMiddleware, (req, res) => userProgressController.addMilestone(req, res));

export default router;
