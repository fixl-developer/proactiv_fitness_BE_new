import { Request, Response } from 'express';
import { DynamicPricingService } from './pricing.service';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { sendSuccess } from '../../shared/utils/response.util';

const pricingService = new DynamicPricingService();

export class DynamicPricingController {
    calculatePrice = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id || 'system';
        const pricing = await pricingService.calculatePrice(req.body, userId);
        sendSuccess(res, pricing, 'Price calculated successfully', 201);
    });

    getCurrentPricing = asyncHandler(async (req: Request, res: Response) => {
        const { programId } = req.params;
        const pricing = await pricingService.getCurrentPricing(programId);
        sendSuccess(res, pricing, 'Pricing retrieved successfully');
    });
}
