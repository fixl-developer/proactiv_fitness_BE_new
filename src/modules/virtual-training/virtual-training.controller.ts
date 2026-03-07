import { Request, Response, NextFunction } from 'express';
import { virtualTrainingService } from './virtual-training.service';
import { AppError } from '../../utils/appError';

export class VirtualTrainingController {
    async createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const session = await virtualTrainingService.createSession(req.body);
            res.status(201).json({ success: true, data: session });
        } catch (error) {
            next(error);
        }
    }

    async startSession(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const session = await virtualTrainingService.startSession(id);
            res.status(200).json({ success: true, data: session });
        } catch (error) {
            next(error);
        }
    }

    async endSession(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const session = await virtualTrainingService.endSession(id);
            res.status(200).json({ success: true, data: session });
        } catch (error) {
            next(error);
        }
    }

    async joinSession(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { userId, role } = req.body;
            const result = await virtualTrainingService.joinSession(id, userId, role);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getLibrary(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const videos = await virtualTrainingService.getLibrary(req.query);
            res.status(200).json({ success: true, count: videos.length, data: videos });
        } catch (error) {
            next(error);
        }
    }

    async trackAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { sessionId, userId } = req.body;
            const attendance = await virtualTrainingService.trackAttendance(sessionId, userId);
            res.status(200).json({ success: true, data: attendance });
        } catch (error) {
            next(error);
        }
    }

    async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { sessionId } = req.params;
            const analytics = await virtualTrainingService.getAnalytics(sessionId);
            res.status(200).json({ success: true, data: analytics });
        } catch (error) {
            next(error);
        }
    }
}

export const virtualTrainingController = new VirtualTrainingController();
