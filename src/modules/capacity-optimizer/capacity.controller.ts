import { Request, Response } from 'express';
import { CapacityOptimizerService } from './capacity.service';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { sendSuccess } from '../../shared/utils/response.util';

const capacityService = new CapacityOptimizerService();

export class CapacityOptimizerController {
    monitorCapacity = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id || 'system';
        const monitor = await capacityService.monitorCapacity(req.body, userId);
        sendSuccess(res, monitor, 'Capacity monitored successfully', 201);
    });

    executeRebalance = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id || 'system';
        const execution = await capacityService.executeRebalance(req.body, userId);
        sendSuccess(res, execution, 'Rebalance executed successfully', 201);
    });

    getCapacitySummary = asyncHandler(async (req: Request, res: Response) => {
        const { locationId } = req.params;
        const summary = await capacityService.getCapacitySummary(locationId);
        sendSuccess(res, summary, 'Capacity summary retrieved successfully');
    });
}
