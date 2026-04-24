import { Request, Response } from 'express';
import { userDashboardService } from './user-dashboard.service';

export class UserDashboardController {
    async getDashboard(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const dashboardData = await userDashboardService.getDashboardData(userId);
            res.status(200).json({ success: true, data: dashboardData });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getStats(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const stats = await userDashboardService.getStats(userId);
            res.status(200).json({ success: true, data: stats });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getRecentActivity(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const activity = await userDashboardService.getRecentActivity(userId);
            res.status(200).json({ success: true, data: activity });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getUpcoming(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const upcoming = await userDashboardService.getUpcoming(userId);
            res.status(200).json({ success: true, data: upcoming });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

export const userDashboardController = new UserDashboardController();
