import { Request, Response } from 'express';
import { userProgressService } from './user-progress.service';

export class UserProgressController {
    async getProgress(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            let progress = await userProgressService.getProgress(userId);
            if (!progress) {
                progress = await userProgressService.createProgress(userId);
            }

            res.status(200).json({ success: true, data: progress });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getTimeline(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const timeline = await userProgressService.getTimeline(userId);
            res.status(200).json({ success: true, data: timeline });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getSkillLevels(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const skills = await userProgressService.getSkillLevels(userId);
            res.status(200).json({ success: true, data: skills });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getPerformanceMetrics(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const metrics = await userProgressService.getPerformanceMetrics(userId);
            res.status(200).json({ success: true, data: metrics });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async addMilestone(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const milestone = req.body;

            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            await userProgressService.addMilestone(userId, milestone);
            res.status(200).json({ success: true, message: 'Milestone added' });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

export const userProgressController = new UserProgressController();
