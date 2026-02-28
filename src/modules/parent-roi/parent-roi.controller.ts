import { Request, Response } from 'express';
import { ParentROIService } from './parent-roi.service';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { sendSuccess } from '../../shared/utils/response.util';

const roiService = new ParentROIService();

export class ParentROIController {
    // Calculate ROI Dashboard
    calculateROI = asyncHandler(async (req: Request, res: Response) => {
        const { familyId, childId, periodStart, periodEnd } = req.body;
        const userId = (req as any).user?.id || 'system';

        const dashboard = await roiService.calculateROI(
            {
                familyId,
                childId,
                periodStart: new Date(periodStart),
                periodEnd: new Date(periodEnd)
            },
            userId
        );

        sendSuccess(res, dashboard, 'ROI dashboard calculated successfully', 201);
    });

    // Get ROI Dashboard
    getROIDashboard = asyncHandler(async (req: Request, res: Response) => {
        const { childId } = req.params;
        const summary = await roiService.getROISummary(childId);
        sendSuccess(res, summary, 'ROI dashboard retrieved successfully');
    });

    // Generate ROI Report
    generateReport = asyncHandler(async (req: Request, res: Response) => {
        const { familyId, childId, reportType, periodStart, periodEnd, includeComparisons, deliveryMethod } = req.body;
        const userId = (req as any).user?.id || 'system';

        const report = await roiService.generateReport(
            {
                familyId,
                childId,
                reportType,
                periodStart: new Date(periodStart),
                periodEnd: new Date(periodEnd),
                includeComparisons: includeComparisons || false,
                deliveryMethod: deliveryMethod || 'download'
            },
            userId
        );

        sendSuccess(res, report, 'ROI report generated successfully', 201);
    });

    // Get ROI Summary
    getROISummary = asyncHandler(async (req: Request, res: Response) => {
        const { childId } = req.params;
        const summary = await roiService.getROISummary(childId);
        sendSuccess(res, summary, 'ROI summary retrieved successfully');
    });
}
