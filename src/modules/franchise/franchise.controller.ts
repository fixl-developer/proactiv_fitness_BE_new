import { Request, Response } from 'express';
import { FranchiseService } from './franchise.service';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { sendSuccess } from '../../shared/utils/response.util';

const franchiseService = new FranchiseService();

export class FranchiseController {
    createFranchise = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id || 'system';
        const franchise = await franchiseService.createFranchise(req.body, userId);
        sendSuccess(res, franchise, 'Franchise created successfully', 201);
    });

    getAllFranchises = asyncHandler(async (req: Request, res: Response) => {
        const franchises = await franchiseService.getAllFranchises();
        sendSuccess(res, franchises, 'Franchises retrieved successfully');
    });

    getFranchiseSummary = asyncHandler(async (req: Request, res: Response) => {
        const { franchiseId } = req.params;
        const summary = await franchiseService.getFranchiseSummary(franchiseId);
        sendSuccess(res, summary, 'Franchise summary retrieved successfully');
    });

    getFranchiseDashboard = asyncHandler(async (req: Request, res: Response) => {
        const { franchiseId } = req.params;
        const dashboard = await franchiseService.getFranchiseDashboard(franchiseId);
        sendSuccess(res, dashboard, 'Franchise dashboard retrieved successfully');
    });

    calculateRoyalty = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id || 'system';
        const calculation = await franchiseService.calculateRoyalty(req.body, userId);
        sendSuccess(res, calculation, 'Royalty calculated successfully', 201);
    });

    generatePL = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id || 'system';
        const pl = await franchiseService.generatePL(req.body, userId);
        sendSuccess(res, pl, 'P&L generated successfully', 201);
    });

    updateFranchise = asyncHandler(async (req: Request, res: Response) => {
        const { franchiseId } = req.params;
        const userId = (req as any).user?.id || 'system';
        const franchise = await franchiseService.updateFranchise(franchiseId, req.body, userId);
        sendSuccess(res, franchise, 'Franchise updated successfully');
    });
}
