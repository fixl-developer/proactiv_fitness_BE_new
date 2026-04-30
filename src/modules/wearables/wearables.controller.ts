import { Request, Response } from 'express';
import wearablesService from './wearables.service';
import { asyncHandler } from '../../shared/utils/async-handler.util';

class WearablesController {
    getConnectedDevices = asyncHandler(async (req: Request, res: Response) => {
        const devices = await wearablesService.getConnectedDevices(req.user.id);
        res.json({ success: true, data: devices });
    });

    connectDevice = asyncHandler(async (req: Request, res: Response) => {
        const device = await wearablesService.connectDevice(req.user.id, req.body);
        res.status(201).json({ success: true, data: device });
    });

    disconnectDevice = asyncHandler(async (req: Request, res: Response) => {
        await wearablesService.disconnectDevice(req.params.id);
        res.json({ success: true, message: 'Device disconnected' });
    });

    syncDevice = asyncHandler(async (req: Request, res: Response) => {
        const result = await wearablesService.syncDevice(req.params.id);
        res.json({ success: true, data: result });
    });

    getFitnessData = asyncHandler(async (req: Request, res: Response) => {
        const data = await wearablesService.getFitnessData(req.user.id, req.query);
        res.json({ success: true, data });
    });

    getTodayStats = asyncHandler(async (req: Request, res: Response) => {
        const stats = await wearablesService.getTodayStats(req.user.id);
        res.json({ success: true, data: stats });
    });

    getWeeklyStats = asyncHandler(async (req: Request, res: Response) => {
        const stats = await wearablesService.getWeeklyStats(req.user.id);
        res.json({ success: true, data: stats });
    });

    getMonthlyStats = asyncHandler(async (req: Request, res: Response) => {
        const stats = await wearablesService.getMonthlyStats(req.user.id);
        res.json({ success: true, data: stats });
    });

    setFitnessGoal = asyncHandler(async (req: Request, res: Response) => {
        const result = await wearablesService.setFitnessGoal(req.user.id, req.body);
        res.json({ success: true, data: result });
    });

    getFitnessGoals = asyncHandler(async (req: Request, res: Response) => {
        const goals = await wearablesService.getFitnessGoals(req.user.id);
        res.json({ success: true, data: goals });
    });

    getFitnessInsights = asyncHandler(async (req: Request, res: Response) => {
        const insights = await wearablesService.getFitnessInsights(req.user.id);
        res.json({ success: true, data: insights });
    });
}

export default new WearablesController();
