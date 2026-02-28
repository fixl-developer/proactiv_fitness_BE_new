import { LoyaltyPoints, Streak, Achievement, UnlockedAchievement, Leaderboard, Reward, Redemption, Challenge } from './gamification.model';
import {
    IAwardPointsRequest,
    IUpdateStreakRequest,
    IUnlockAchievementRequest,
    IRedeemRewardRequest,
    IJoinChallengeRequest,
    IGamificationProfile,
    PointTransactionType
} from './gamification.interface';
import { AppError } from '../../shared/utils/app-error.util';
import { v4 as uuidv4 } from 'uuid';

export class GamificationService {
    // Points Management
    async awardPoints(data: IAwardPointsRequest, userId: string): Promise<any> {
        try {
            let loyaltyPoints = await LoyaltyPoints.findOne({ userId: data.userId });

            if (!loyaltyPoints) {
                loyaltyPoints = new LoyaltyPoints({
                    userId: data.userId,
                    userName: await this.getUserName(data.userId),
                    businessUnitId: 'bu-001',
                    locationId: 'loc-001',
                    createdBy: userId,
                    updatedBy: userId
                });
            }

            const transaction = {
                transactionId: uuidv4(),
                type: PointTransactionType.EARNED,
                points: data.points,
                balance: loyaltyPoints.currentBalance + data.points,
                reason: data.reason,
                relatedEntity: data.relatedEntity,
                relatedEntityType: data.relatedEntityType,
                date: new Date()
            };

            loyaltyPoints.totalPointsEarned += data.points;
            loyaltyPoints.currentBalance += data.points;
            loyaltyPoints.lifetimePoints += data.points;
            loyaltyPoints.transactions.push(transaction);
            loyaltyPoints.updatedBy = userId;

            await loyaltyPoints.save();
            return loyaltyPoints;
        } catch (error: any) {
            throw new AppError(error.message || 'Failed to award points', 500);
        }
    }

    async getPointsBalance(userId: string): Promise<any> {
        const loyaltyPoints = await LoyaltyPoints.findOne({ userId });
        if (!loyaltyPoints) {
            throw new AppError('Loyalty points not found', 404);
        }
        return {
            userId: loyaltyPoints.userId,
            currentBalance: loyaltyPoints.currentBalance,
            lifetimePoints: loyaltyPoints.lifetimePoints,
            currentTier: loyaltyPoints.currentTier
        };
    }

    // Streak Management
    async updateStreak(data: IUpdateStreakRequest, userId: string): Promise<any> {
        try {
            let streak = await Streak.findOne({ userId: data.userId, streakType: data.streakType });

            if (!streak) {
                streak = new Streak({
                    userId: data.userId,
                    userName: await this.getUserName(data.userId),
                    streakType: data.streakType,
                    streakName: `${data.streakType} Streak`,
                    businessUnitId: 'bu-001',
                    locationId: 'loc-001',
                    createdBy: userId,
                    updatedBy: userId
                });
            }

            const daysDiff = this.calculateDaysDifference(streak.lastActivityDate, data.activityDate);

            if (daysDiff === 1) {
                streak.currentStreak += 1;
            } else if (daysDiff > 1) {
                if (streak.currentStreak > 0) {
                    streak.streakHistory.push({
                        startDate: new Date(data.activityDate.getTime() - streak.currentStreak * 24 * 60 * 60 * 1000),
                        endDate: streak.lastActivityDate || new Date(),
                        streakLength: streak.currentStreak,
                        reason: 'Streak broken'
                    });
                }
                streak.currentStreak = 1;
            }

            if (streak.currentStreak > streak.longestStreak) {
                streak.longestStreak = streak.currentStreak;
            }

            streak.lastActivityDate = data.activityDate;
            streak.updatedBy = userId;

            await streak.save();
            return streak;
        } catch (error: any) {
            throw new AppError(error.message || 'Failed to update streak', 500);
        }
    }

    async getStreaks(userId: string): Promise<any[]> {
        return await Streak.find({ userId, isActive: true });
    }

    // Achievement Management
    async unlockAchievement(data: IUnlockAchievementRequest, userId: string): Promise<any> {
        try {
            const achievement = await Achievement.findOne({ achievementId: data.achievementId });
            if (!achievement) {
                throw new AppError('Achievement not found', 404);
            }

            const unlockedAchievementId = uuidv4();
            const unlockedAchievement = new UnlockedAchievement({
                unlockedAchievementId,
                achievementId: data.achievementId,
                achievementName: achievement.name,
                userId: data.userId,
                userName: await this.getUserName(data.userId),
                progress: data.progress,
                isCompleted: data.progress >= 100,
                completedDate: data.progress >= 100 ? new Date() : undefined,
                unlockContext: data.context,
                pointsClaimed: achievement.pointsReward,
                businessUnitId: 'bu-001',
                locationId: 'loc-001',
                createdBy: userId,
                updatedBy: userId
            });

            await unlockedAchievement.save();

            // Award points
            if (achievement.pointsReward > 0) {
                await this.awardPoints({
                    userId: data.userId,
                    points: achievement.pointsReward,
                    reason: `Achievement unlocked: ${achievement.name}`,
                    relatedEntity: data.achievementId,
                    relatedEntityType: 'achievement'
                }, userId);
            }

            return unlockedAchievement;
        } catch (error: any) {
            throw new AppError(error.message || 'Failed to unlock achievement', 500);
        }
    }

    async getAchievements(userId: string): Promise<any> {
        const unlocked = await UnlockedAchievement.find({ userId });
        const all = await Achievement.find({ isActive: true });

        return {
            total: unlocked.length,
            unlocked,
            available: all.filter(a => !unlocked.find(u => u.achievementId === a.achievementId))
        };
    }

    // Reward Management
    async redeemReward(data: IRedeemRewardRequest, userId: string): Promise<any> {
        try {
            const reward = await Reward.findOne({ rewardId: data.rewardId });
            if (!reward) {
                throw new AppError('Reward not found', 404);
            }

            const loyaltyPoints = await LoyaltyPoints.findOne({ userId: data.userId });
            if (!loyaltyPoints || loyaltyPoints.currentBalance < reward.pointsCost) {
                throw new AppError('Insufficient points', 400);
            }

            const redemptionId = uuidv4();
            const redemption = new Redemption({
                redemptionId,
                rewardId: data.rewardId,
                rewardName: reward.name,
                userId: data.userId,
                userName: await this.getUserName(data.userId),
                pointsSpent: reward.pointsCost,
                status: reward.redemptionRules.requiresApproval ? 'pending' : 'approved',
                requiresApproval: reward.redemptionRules.requiresApproval,
                businessUnitId: 'bu-001',
                locationId: 'loc-001',
                createdBy: userId,
                updatedBy: userId
            });

            await redemption.save();

            // Deduct points
            loyaltyPoints.currentBalance -= reward.pointsCost;
            loyaltyPoints.totalPointsSpent += reward.pointsCost;
            loyaltyPoints.transactions.push({
                transactionId: uuidv4(),
                type: PointTransactionType.SPENT,
                points: -reward.pointsCost,
                balance: loyaltyPoints.currentBalance,
                reason: `Redeemed: ${reward.name}`,
                relatedEntity: redemptionId,
                relatedEntityType: 'redemption',
                date: new Date()
            });

            await loyaltyPoints.save();

            return redemption;
        } catch (error: any) {
            throw new AppError(error.message || 'Failed to redeem reward', 500);
        }
    }

    async getAvailableRewards(userId: string): Promise<any[]> {
        return await Reward.find({ isActive: true, status: 'available' });
    }

    // Challenge Management
    async joinChallenge(data: IJoinChallengeRequest, userId: string): Promise<any> {
        try {
            const challenge = await Challenge.findOne({ challengeId: data.challengeId });
            if (!challenge) {
                throw new AppError('Challenge not found', 404);
            }

            const alreadyJoined = challenge.participants.find(p => p.userId === data.userId);
            if (alreadyJoined) {
                throw new AppError('Already joined this challenge', 400);
            }

            challenge.participants.push({
                userId: data.userId,
                userName: await this.getUserName(data.userId),
                progress: 0,
                joinedDate: new Date()
            });

            challenge.updatedBy = userId;
            await challenge.save();

            return challenge;
        } catch (error: any) {
            throw new AppError(error.message || 'Failed to join challenge', 500);
        }
    }

    async getActiveChallenges(): Promise<any[]> {
        return await Challenge.find({ status: 'active', isActive: true });
    }

    // Leaderboard Management
    async getLeaderboard(leaderboardId: string): Promise<any> {
        const leaderboard = await Leaderboard.findOne({ leaderboardId, isActive: true });
        if (!leaderboard) {
            throw new AppError('Leaderboard not found', 404);
        }
        return leaderboard;
    }

    // Gamification Profile
    async getGamificationProfile(userId: string): Promise<IGamificationProfile> {
        const points = await LoyaltyPoints.findOne({ userId });
        const streaks = await Streak.find({ userId, isActive: true });
        const achievements = await UnlockedAchievement.find({ userId });

        return {
            userId,
            userName: await this.getUserName(userId),
            points: {
                current: points?.currentBalance || 0,
                lifetime: points?.lifetimePoints || 0,
                rank: 0
            },
            streaks: {
                attendance: streaks.find(s => s.streakType === 'attendance')?.currentStreak || 0,
                longest: Math.max(...streaks.map(s => s.longestStreak), 0)
            },
            achievements: {
                total: achievements.length,
                byCategory: [],
                recent: achievements.slice(-5)
            },
            tier: {
                current: points?.currentTier || 'bronze',
                progress: points?.tierProgress || 0,
                nextTier: points?.nextTier || 'silver'
            },
            leaderboards: []
        };
    }

    // Helper methods
    private calculateDaysDifference(date1: Date | undefined, date2: Date): number {
        if (!date1) return 999;
        const diff = Math.abs(date2.getTime() - date1.getTime());
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    private async getUserName(userId: string): Promise<string> {
        return 'User Name';
    }
}
