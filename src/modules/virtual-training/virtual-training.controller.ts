import { Request, Response, NextFunction } from 'express';
import { VirtualTrainingService } from './virtual-training.service';

const service = new VirtualTrainingService();

export class VirtualTrainingController {
    async createSession(req: Request, res: Response, next: NextFunction) {
        try {
            const session = await service.createSession(req.body);
            res.status(201).json({ success: true, data: session });
        } catch (error) {
            next(error);
        }
    }

    async getSessions(req: Request, res: Response, next: NextFunction) {
        try {
            const sessions = await service.getSessions(req.query);
            res.json({ success: true, data: sessions });
        } catch (error) {
            next(error);
        }
    }

    async getSessionById(req: Request, res: Response, next: NextFunction) {
        try {
            const session = await service.getSessionById(req.params.id);
            res.json({ success: true, data: session });
        } catch (error) {
            next(error);
        }
    }

    async updateSession(req: Request, res: Response, next: NextFunction) {
        try {
            const session = await service.updateSession(req.params.id, req.body);
            res.json({ success: true, data: session });
        } catch (error) {
            next(error);
        }
    }

    async joinSession(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id || req.body.userId;
            const session = await service.joinSession(req.params.id, userId);
            res.json({ success: true, data: session });
        } catch (error) {
            next(error);
        }
    }
}
