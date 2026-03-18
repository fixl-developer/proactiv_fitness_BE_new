import { Request, Response } from 'express';
import { userAchievementsService } from './user-achievements.service';

export class UserAchievementsController {
    async getAllAchievements(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const achievements = await userAchievementsService.getAllAchievements(userId);
            res.status(200).json({ success: true, data: achievements });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getEarnedAchievements(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const achievements = await userAchievementsService.getEarnedAchievements(userId);
            res.status(200).json({ success: true, data: achievements });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getAvailableAchievements(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const achievements = await userAchievementsService.getAvailableAchievements(userId);
            res.status(200).json({ success: true, data: achievements });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getAchievementDetails(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const { achievementId } = req.params;

            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const achievement = await userAchievementsService.getAchievementById(userId, achievementId);
            if (!achievement) {
                res.status(404).json({ success: false, message: 'Achievement not found' });
                return;
            }

            res.status(200).json({ success: true, data: achievement });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async claimReward(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const { achievementId } = req.params;

            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const achievement = await userAchievementsService.claimReward(userId, achievementId);
            if (!achievement) {
                res.status(404).json({ success: false, message: 'Achievement not found or not completed' });
                return;
            }

            res.status(200).json({
                success: true,
                data: achievement,
                message: 'Reward claimed successfully'
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getTotalPoints(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const totalPoints = await userAchievementsService.getTotalPoints(userId);
            res.status(200).json({ success: true, data: { totalPoints } });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

export const userAchievementsController = new UserAchievementsController();
