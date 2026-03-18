import { UserAchievementModel } from './user-achievements.model';
import { IUserAchievement } from './user-achievements.interface';

export class UserAchievementsService {
    async getAllAchievements(userId: string): Promise<IUserAchievement[]> {
        return await UserAchievementModel.find({ userId }).sort({ earnedAt: -1 }).lean();
    }

    async getEarnedAchievements(userId: string): Promise<IUserAchievement[]> {
        return await UserAchievementModel.find({ userId, isCompleted: true }).lean();
    }

    async getAvailableAchievements(userId: string): Promise<IUserAchievement[]> {
        return await UserAchievementModel.find({ userId, isCompleted: false }).lean();
    }

    async getAchievementById(userId: string, achievementId: string): Promise<IUserAchievement | null> {
        return await UserAchievementModel.findOne({ userId, achievementId }).lean();
    }

    async unlockAchievement(userId: string, achievementId: string): Promise<IUserAchievement | null> {
        return await UserAchievementModel.findOneAndUpdate(
            { userId, achievementId },
            {
                $set: {
                    isCompleted: true,
                    earnedAt: new Date(),
                    progress: 100
                }
            },
            { new: true }
        ).lean();
    }

    async updateProgress(userId: string, achievementId: string, progress: number): Promise<void> {
        await UserAchievementModel.findOneAndUpdate(
            { userId, achievementId },
            { $set: { progress } }
        );
    }

    async claimReward(userId: string, achievementId: string): Promise<IUserAchievement | null> {
        return await UserAchievementModel.findOneAndUpdate(
            { userId, achievementId, isCompleted: true },
            {
                $set: {
                    'reward.claimed': true,
                    'reward.claimedAt': new Date()
                }
            },
            { new: true }
        ).lean();
    }

    async getTotalPoints(userId: string): Promise<number> {
        const achievements = await UserAchievementModel.find({
            userId,
            isCompleted: true
        }, 'points').lean();

        return achievements.reduce((total, ach) => total + (ach.points || 0), 0);
    }

    async getAchievementsByCategory(userId: string, category: string): Promise<IUserAchievement[]> {
        return await UserAchievementModel.find({ userId, category }).lean();
    }
}

export const userAchievementsService = new UserAchievementsService();
