import { Router } from 'express';
import { GamificationController } from './gamification.controller';

const router = Router();
const controller = new GamificationController();

// Points Routes
router.post('/points/award', controller.awardPoints);
router.get('/points/:userId', controller.getPointsBalance);

// Streak Routes
router.post('/streaks/update', controller.updateStreak);
router.get('/streaks/:userId', controller.getStreaks);

// Achievement Routes
router.post('/achievements/unlock', controller.unlockAchievement);
router.get('/achievements/:userId', controller.getAchievements);

// Reward Routes
router.post('/rewards/redeem', controller.redeemReward);
router.get('/rewards/:userId', controller.getAvailableRewards);

// Challenge Routes
router.post('/challenges/join', controller.joinChallenge);
router.get('/challenges/active', controller.getActiveChallenges);

// Leaderboard Routes
router.get('/leaderboards/:leaderboardId', controller.getLeaderboard);

// Profile Routes
router.get('/profile/:userId', controller.getGamificationProfile);

export default router;
