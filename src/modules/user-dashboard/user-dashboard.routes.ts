import { Router } from 'express';
import { userDashboardController } from './user-dashboard.controller';
import { authMiddleware } from '../iam/auth.middleware';

const router = Router();

router.get('/dashboard', authMiddleware, (req, res) => userDashboardController.getDashboard(req, res));
router.get('/dashboard/stats', authMiddleware, (req, res) => userDashboardController.getStats(req, res));
router.get('/dashboard/activity', authMiddleware, (req, res) => userDashboardController.getRecentActivity(req, res));
router.get('/dashboard/upcoming', authMiddleware, (req, res) => userDashboardController.getUpcoming(req, res));

export default router;
