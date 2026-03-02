import { Request, Response } from 'express';
import { DataDeletionService } from './deletion.service';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { sendSuccess } from '../../shared/utils/response.util';

const deletionService = new DataDeletionService();

export const createDeletionRequest = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || 'system';
    const userName = (req as any).user?.userName || 'System User';
    const email = (req as any).user?.email || 'user@example.com';

    const request = await deletionService.createDeletionRequest(req.body, userId, userName, email);
    sendSuccess(res, request, 'Deletion request created successfully', 201);
});

export const getDeletionRequests = asyncHandler(async (req: Request, res: Response) => {
    const requests = await deletionService.getDeletionRequests(req.query);
    sendSuccess(res, requests, 'Deletion requests retrieved successfully');
});

export const getDeletionRequest = asyncHandler(async (req: Request, res: Response) => {
    const { requestId } = req.params;
    const request = await deletionService.getDeletionRequest(requestId);
    sendSuccess(res, request, 'Deletion request retrieved successfully');
});

export const approveDeletionRequest = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || 'system';
    const userName = (req as any).user?.userName || 'System User';

    const request = await deletionService.approveDeletionRequest(req.body, userId, userName);
    sendSuccess(res, request, 'Deletion request approval processed successfully');
});

export const executeDeletion = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || 'system';

    const result = await deletionService.executeDeletion(req.body, userId);
    sendSuccess(res, result, 'Deletion execution started successfully');
});

export const getCertificate = asyncHandler(async (req: Request, res: Response) => {
    const { requestId } = req.params;
    const certificate = await deletionService.getCertificate(requestId);
    sendSuccess(res, certificate, 'Certificate retrieved successfully');
});

export const createRetentionPolicy = asyncHandler(async (req: Request, res: Response) => {
    const { policyName, description, dataCategory, retentionPeriod, retentionUnit, legalBasis, jurisdiction } = req.body;
    const userId = (req as any).user?.userId || 'system';

    const policy = await deletionService.createRetentionPolicy(policyName, description, dataCategory, retentionPeriod, retentionUnit, legalBasis, jurisdiction, userId);
    sendSuccess(res, policy, 'Retention policy created successfully', 201);
});

export const getRetentionPolicies = asyncHandler(async (req: Request, res: Response) => {
    const policies = await deletionService.getRetentionPolicies();
    sendSuccess(res, policies, 'Retention policies retrieved successfully');
});

export const getAnonymizationLogs = asyncHandler(async (req: Request, res: Response) => {
    const { requestId } = req.params;
    const logs = await deletionService.getAnonymizationLogs(requestId);
    sendSuccess(res, logs, 'Anonymization logs retrieved successfully');
});
