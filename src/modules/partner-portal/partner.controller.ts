import { Request, Response } from 'express';
import { PartnerService } from './partner.service';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { sendSuccess } from '../../shared/utils/response.util';

const partnerService = new PartnerService();

export class PartnerController {
    createPartner = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id || 'system';
        const partner = await partnerService.createPartner(req.body, userId);
        sendSuccess(res, partner, 'Partner created successfully', 201);
    });

    getAllPartners = asyncHandler(async (req: Request, res: Response) => {
        const partners = await partnerService.getAllPartners();
        sendSuccess(res, partners, 'Partners retrieved successfully');
    });

    getPartnerDashboard = asyncHandler(async (req: Request, res: Response) => {
        const { partnerId } = req.params;
        const dashboard = await partnerService.getPartnerDashboard(partnerId);
        sendSuccess(res, dashboard, 'Partner dashboard retrieved successfully');
    });

    bulkImportStudents = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id || 'system';
        const result = await partnerService.bulkImportStudents(req.body, userId);
        sendSuccess(res, result, 'Bulk import initiated successfully', 201);
    });
}
