import { Router } from 'express';
import { userDashboardController } from './user-dashboard.controller';
import { authMiddleware } from '../iam/auth.middleware';

const router = Router();

router.get('/', authMiddleware, (req, res) => userDashboardController.getDashboard(req, res));
router.get('/stats', authMiddleware, (req, res) => userDashboardController.getStats(req, res));
router.get('/activity', authMiddleware, (req, res) => userDashboardController.getRecentActivity(req, res));
router.get('/upcoming', authMiddleware, (req, res) => userDashboardController.getUpcoming(req, res));

export default router;
