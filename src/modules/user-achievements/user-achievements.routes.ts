import { Router } from 'express';
import { userAchievementsController } from './user-achievements.controller';
import { authMiddleware } from '../iam/auth.middleware';

const router = Router();

router.get('/achievements', authMiddleware, (req, res) => userAchievementsController.getAllAchievements(req, res));
router.get('/achievements/earned', authMiddleware, (req, res) => userAchievementsController.getEarnedAchievements(req, res));
router.get('/achievements/available', authMiddleware, (req, res) => userAchievementsController.getAvailableAchievements(req, res));
router.get('/achievements/points', authMiddleware, (req, res) => userAchievementsController.getTotalPoints(req, res));
router.get('/achievements/:achievementId', authMiddleware, (req, res) => userAchievementsController.getAchievementDetails(req, res));
router.post('/achievements/:achievementId/claim', authMiddleware, (req, res) => userAchievementsController.claimReward(req, res));

export default router;
