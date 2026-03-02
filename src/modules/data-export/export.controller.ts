import { Request, Response } from 'express';
import { DataExportService } from './export.service';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { sendSuccess } from '../../shared/utils/response.util';

const exportService = new DataExportService();

export const createExport = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || 'system';
    const userName = (req as any).user?.userName || 'System User';
    const email = (req as any).user?.email || 'user@example.com';

    const exportPack = await exportService.createExport(req.body, userId, userName, email);
    sendSuccess(res, exportPack, 'Export created successfully', 201);
});

export const createParentExport = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || 'system';
    const userName = (req as any).user?.userName || 'System User';
    const email = (req as any).user?.email || 'user@example.com';

    const exportPack = await exportService.createParentExport(req.body, userId, userName, email);
    sendSuccess(res, exportPack, 'Parent export created successfully', 201);
});

export const createFranchiseExport = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || 'system';
    const userName = (req as any).user?.userName || 'System User';
    const email = (req as any).user?.email || 'user@example.com';

    const exportPack = await exportService.createFranchiseExport(req.body, userId, userName, email);
    sendSuccess(res, exportPack, 'Franchise export created successfully', 201);
});

export const getExports = asyncHandler(async (req: Request, res: Response) => {
    const exports = await exportService.getExports(req.query);
    sendSuccess(res, exports, 'Exports retrieved successfully');
});

export const getExport = asyncHandler(async (req: Request, res: Response) => {
    const { exportId } = req.params;
    const exportPack = await exportService.getExport(exportId);
    sendSuccess(res, exportPack, 'Export retrieved successfully');
});

export const downloadExport = asyncHandler(async (req: Request, res: Response) => {
    const { exportId } = req.params;
    const userId = (req as any).user?.userId || 'system';

    const download = await exportService.downloadExport(exportId, userId);
    sendSuccess(res, download, 'Export download initiated');
});

export const scheduleExport = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || 'system';

    const exportPack = await exportService.scheduleExport(req.body, userId);
    sendSuccess(res, exportPack, 'Export scheduled successfully');
});

export const createTemplate = asyncHandler(async (req: Request, res: Response) => {
    const { templateName, description, exportType, dataCategories, format } = req.body;
    const userId = (req as any).user?.userId || 'system';

    const template = await exportService.createTemplate(templateName, description, exportType, dataCategories, format, userId);
    sendSuccess(res, template, 'Template created successfully', 201);
});

export const getTemplates = asyncHandler(async (req: Request, res: Response) => {
    const templates = await exportService.getTemplates();
    sendSuccess(res, templates, 'Templates retrieved successfully');
});

export const getExportHistory = asyncHandler(async (req: Request, res: Response) => {
    const { exportId } = req.params;
    const history = await exportService.getExportHistory(exportId);
    sendSuccess(res, history, 'Export history retrieved successfully');
});
