import { Request, Response, NextFunction } from 'express';
import { wearablesService } from './wearables.service';

export class WearablesController {
    async connectDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const device = await wearablesService.connectDevice(req.body);
            res.status(201).json({ success: true, data: device });
        } catch (error) {
            next(error);
        }
    }

    async getDevices(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId } = req.params;
            const devices = await wearablesService.getDevices(userId);
            res.status(200).json({ success: true, count: devices.length, data: devices });
        } catch (error) {
            next(error);
        }
    }

    async syncData(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId, deviceId, data } = req.body;
            const result = await wearablesService.syncData(userId, deviceId, data);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId } = req.params;
            const { startDate, endDate } = req.query;
            const metrics = await wearablesService.getMetrics(
                userId,
                startDate ? new Date(startDate as string) : undefined,
                endDate ? new Date(endDate as string) : undefined
            );
            res.status(200).json({ success: true, count: metrics.length, data: metrics });
        } catch (error) {
            next(error);
        }
    }

    async logWorkout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const workout = await wearablesService.logWorkout(req.body);
            res.status(201).json({ success: true, data: workout });
        } catch (error) {
            next(error);
        }
    }

    async getHeartRate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId } = req.params;
            const { startDate, endDate } = req.query;
            const data = await wearablesService.getHeartRate(
                userId,
                startDate ? new Date(startDate as string) : undefined,
                endDate ? new Date(endDate as string) : undefined
            );
            res.status(200).json({ success: true, count: data.length, data });
        } catch (error) {
            next(error);
        }
    }

    async getSleep(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId } = req.params;
            const days = parseInt(req.query.days as string) || 7;
            const sleep = await wearablesService.getSleep(userId, days);
            res.status(200).json({ success: true, count: sleep.length, data: sleep });
        } catch (error) {
            next(error);
        }
    }

    async geofenceCheckin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const checkin = await wearablesService.geofenceCheckin(req.body);
            res.status(201).json({ success: true, data: checkin });
        } catch (error) {
            next(error);
        }
    }
}

export const wearablesController = new WearablesController();
