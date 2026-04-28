import { Router } from 'express';
import { userAchievementsController } from './user-achievements.controller';
import { authMiddleware } from '../iam/auth.middleware';

const router = Router();

router.get('/', authMiddleware, (req, res) => userAchievementsController.getAllAchievements(req, res));
router.get('/earned', authMiddleware, (req, res) => userAchievementsController.getEarnedAchievements(req, res));
router.get('/available', authMiddleware, (req, res) => userAchievementsController.getAvailableAchievements(req, res));
router.get('/points', authMiddleware, (req, res) => userAchievementsController.getTotalPoints(req, res));
router.get('/stats', authMiddleware, (req, res) => userAchievementsController.getStats(req, res));
router.get('/:achievementId', authMiddleware, (req, res) => userAchievementsController.getAchievementDetails(req, res));
router.post('/:achievementId/claim', authMiddleware, (req, res) => userAchievementsController.claimReward(req, res));

export default router;
