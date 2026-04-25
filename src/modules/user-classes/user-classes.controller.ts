import { Request, Response } from 'express';
import { userClassesService } from './user-classes.service';

export class UserClassesController {
    async getMyClasses(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const { status } = req.query;

            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const classes = await userClassesService.getMyClasses(userId, status as string);
            res.status(200).json({ success: true, data: classes });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getClassDetails(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const { classId } = req.params;

            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const classDetails = await userClassesService.getClassById(userId, classId);
            if (!classDetails) {
                res.status(404).json({ success: false, message: 'Class not found' });
                return;
            }

            res.status(200).json({ success: true, data: classDetails });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getActiveClasses(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const classes = await userClassesService.getActiveClasses(userId);
            res.status(200).json({ success: true, data: classes });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getCompletedClasses(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const classes = await userClassesService.getCompletedClasses(userId);
            res.status(200).json({ success: true, data: classes });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getUpcomingClasses(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const classes = await userClassesService.getUpcomingClasses(userId);
            res.status(200).json({ success: true, data: classes });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getClassAttendance(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const { classId } = req.params;

            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const attendance = await userClassesService.getClassAttendance(userId, classId);
            res.status(200).json({ success: true, data: attendance });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async submitFeedback(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const { classId } = req.params;
            const feedbackData = req.body;

            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            await userClassesService.submitFeedback(userId, classId, feedbackData);
            res.status(200).json({ success: true, message: 'Feedback submitted' });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

export const userClassesController = new UserClassesController();
