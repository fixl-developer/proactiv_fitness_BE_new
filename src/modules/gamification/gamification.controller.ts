import { Request, Response } from 'express';
import { GamificationService } from './gamification.service';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { sendSuccess } from '../../shared/utils/response.util';

const gamificationService = new GamificationService();

export class GamificationController {
    // Points Management
    awardPoints = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id || 'system';
        const result = await gamificationService.awardPoints(req.body, userId);
        sendSuccess(res, result, 'Points awarded successfully', 201);
    });

    getPointsBalance = asyncHandler(async (req: Request, res: Response) => {
        const { userId } = req.params;
        const balance = await gamificationService.getPointsBalance(userId);
        sendSuccess(res, balance, 'Points balance retrieved successfully');
    });

    // Streak Management
    updateStreak = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id || 'system';
        const result = await gamificationService.updateStreak(req.body, userId);
        sendSuccess(res, result, 'Streak updated successfully');
    });

    getStreaks = asyncHandler(async (req: Request, res: Response) => {
        const { userId } = req.params;
        const streaks = await gamificationService.getStreaks(userId);
        sendSuccess(res, streaks, 'Streaks retrieved successfully');
    });

    // Achievement Management
    unlockAchievement = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id || 'system';
        const result = await gamificationService.unlockAchievement(req.body, userId);
        sendSuccess(res, result, 'Achievement unlocked successfully', 201);
    });

    getAchievements = asyncHandler(async (req: Request, res: Response) => {
        const { userId } = req.params;
        const achievements = await gamificationService.getAchievements(userId);
        sendSuccess(res, achievements, 'Achievements retrieved successfully');
    });

    // Reward Management
    redeemReward = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id || 'system';
        const result = await gamificationService.redeemReward(req.body, userId);
        sendSuccess(res, result, 'Reward redeemed successfully', 201);
    });

    getAvailableRewards = asyncHandler(async (req: Request, res: Response) => {
        const { userId } = req.params;
        const rewards = await gamificationService.getAvailableRewards(userId);
        sendSuccess(res, rewards, 'Available rewards retrieved successfully');
    });

    // Challenge Management
    joinChallenge = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id || 'system';
        const result = await gamificationService.joinChallenge(req.body, userId);
        sendSuccess(res, result, 'Joined challenge successfully');
    });

    getActiveChallenges = asyncHandler(async (req: Request, res: Response) => {
        const challenges = await gamificationService.getActiveChallenges();
        sendSuccess(res, challenges, 'Active challenges retrieved successfully');
    });

    // Leaderboard Management
    getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
        const { leaderboardId } = req.params;
        const leaderboard = await gamificationService.getLeaderboard(leaderboardId);
        sendSuccess(res, leaderboard, 'Leaderboard retrieved successfully');
    });

    // Gamification Profile
    getGamificationProfile = asyncHandler(async (req: Request, res: Response) => {
        const { userId } = req.params;
        const profile = await gamificationService.getGamificationProfile(userId);
        sendSuccess(res, profile, 'Gamification profile retrieved successfully');
    });
}
