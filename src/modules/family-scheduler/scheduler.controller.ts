import { Request, Response } from 'express';
import { FamilySchedulerService } from './scheduler.service';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { sendSuccess } from '../../shared/utils/response.util';

const schedulerService = new FamilySchedulerService();

export class FamilySchedulerController {
    optimizeSchedule = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id || 'system';
        const schedule = await schedulerService.optimizeSchedule(req.body, userId);
        sendSuccess(res, schedule, 'Schedule optimized successfully', 201);
    });

    getSchedule = asyncHandler(async (req: Request, res: Response) => {
        const { familyId } = req.params;
        const schedule = await schedulerService.getSchedule(familyId);
        sendSuccess(res, schedule, 'Schedule retrieved successfully');
    });
}
