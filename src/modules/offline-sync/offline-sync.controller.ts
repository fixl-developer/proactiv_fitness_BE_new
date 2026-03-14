// Offline Sync Controller - API Endpoints

import { Request, Response } from 'express';
import { OfflineSyncService } from './offline-sync.service';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { sendSuccess } from '../../shared/utils/response.util';

const offlineSyncService = new OfflineSyncService();

export class OfflineSyncController {
    // ==================== Offline Mode Management ====================

    startOfflineMode = asyncHandler(async (req: Request, res: Response) => {
        const coachId = (req as any).user?.id || req.body.coachId;
        const result = await offlineSyncService.startOfflineMode(coachId);
        sendSuccess(res, result, 'Offline mode started successfully', 200);
    });

    endOfflineMode = asyncHandler(async (req: Request, res: Response) => {
        const coachId = (req as any).user?.id || req.body.coachId;
        const result = await offlineSyncService.endOfflineMode(coachId);
        sendSuccess(res, result, 'Offline mode ended successfully', 200);
    });

    getOfflineModeStatus = asyncHandler(async (req: Request, res: Response) => {
        const { coachId } = req.params;
        const status = await offlineSyncService.getOfflineModeStatus(coachId);
        sendSuccess(res, status, 'Offline mode status retrieved successfully');
    });

    // ==================== Data Storage ====================

    storeOfflineData = asyncHandler(async (req: Request, res: Response) => {
        const coachId = (req as any).user?.id || req.body.coachId;
        const { dataType, data } = req.body;
        const result = await offlineSyncService.storeOfflineData(coachId, dataType, data);
        sendSuccess(res, result, 'Data stored offline successfully', 201);
    });

    getOfflineData = asyncHandler(async (req: Request, res: Response) => {
        const { coachId } = req.params;
        const { synced } = req.query;
        const data = await offlineSyncService.getOfflineData(coachId, synced === 'true' ? true : synced === 'false' ? false : undefined);
        sendSuccess(res, data, 'Offline data retrieved successfully');
    });

    clearOfflineData = asyncHandler(async (req: Request, res: Response) => {
        const coachId = (req as any).user?.id || req.body.coachId;
        await offlineSyncService.clearOfflineData(coachId);
        sendSuccess(res, { message: 'Offline data cleared' }, 'Offline data cleared successfully');
    });

    // ==================== Sync Queue Management ====================

    createSyncQueue = asyncHandler(async (req: Request, res: Response) => {
        const coachId = (req as any).user?.id || req.body.coachId;
        const { items } = req.body;
        const queue = await offlineSyncService.createSyncQueue(coachId, items);
        sendSuccess(res, queue, 'Sync queue created successfully', 201);
    });

    getSyncQueue = asyncHandler(async (req: Request, res: Response) => {
        const { queueId } = req.params;
        const queue = await offlineSyncService.getSyncQueue(queueId);
        sendSuccess(res, queue, 'Sync queue retrieved successfully');
    });

    updateSyncQueueStatus = asyncHandler(async (req: Request, res: Response) => {
        const { queueId } = req.params;
        const { status } = req.body;
        const queue = await offlineSyncService.updateSyncQueueStatus(queueId, status);
        sendSuccess(res, queue, 'Sync queue status updated successfully');
    });

    markItemSynced = asyncHandler(async (req: Request, res: Response) => {
        const { queueId, itemId } = req.params;
        const queue = await offlineSyncService.markItemSynced(queueId, itemId);
        sendSuccess(res, queue, 'Item marked as synced successfully');
    });

    markItemFailed = asyncHandler(async (req: Request, res: Response) => {
        const { queueId, itemId } = req.params;
        const { error } = req.body;
        const queue = await offlineSyncService.markItemFailed(queueId, itemId, error);
        sendSuccess(res, queue, 'Item marked as failed successfully');
    });

    // ==================== Conflict Detection & Resolution ====================

    detectConflict = asyncHandler(async (req: Request, res: Response) => {
        const coachId = (req as any).user?.id || req.body.coachId;
        const { dataType, localData, serverData } = req.body;
        const conflict = await offlineSyncService.detectConflict(coachId, dataType, localData, serverData);
        sendSuccess(res, conflict, 'Conflict detected successfully', 201);
    });

    getConflicts = asyncHandler(async (req: Request, res: Response) => {
        const { coachId } = req.params;
        const { status } = req.query;
        const conflicts = await offlineSyncService.getConflicts(coachId, status as string);
        sendSuccess(res, conflicts, 'Conflicts retrieved successfully');
    });

    resolveConflict = asyncHandler(async (req: Request, res: Response) => {
        const { conflictId } = req.params;
        const { resolution, mergedData } = req.body;
        const conflict = await offlineSyncService.resolveConflict(conflictId, resolution, mergedData);
        sendSuccess(res, conflict, 'Conflict resolved successfully');
    });

    // ==================== Caching ====================

    cacheStudents = asyncHandler(async (req: Request, res: Response) => {
        const coachId = (req as any).user?.id || req.body.coachId;
        const { students } = req.body;
        const cached = await offlineSyncService.cacheStudents(coachId, students);
        sendSuccess(res, cached, 'Students cached successfully', 201);
    });

    getCachedStudents = asyncHandler(async (req: Request, res: Response) => {
        const { coachId } = req.params;
        const cached = await offlineSyncService.getCachedStudents(coachId);
        sendSuccess(res, cached, 'Cached students retrieved successfully');
    });

    cacheClasses = asyncHandler(async (req: Request, res: Response) => {
        const coachId = (req as any).user?.id || req.body.coachId;
        const { classes } = req.body;
        const cached = await offlineSyncService.cacheClasses(coachId, classes);
        sendSuccess(res, cached, 'Classes cached successfully', 201);
    });

    getCachedClasses = asyncHandler(async (req: Request, res: Response) => {
        const { coachId } = req.params;
        const cached = await offlineSyncService.getCachedClasses(coachId);
        sendSuccess(res, cached, 'Cached classes retrieved successfully');
    });

    // ==================== Data Integrity ====================

    verifyDataIntegrity = asyncHandler(async (req: Request, res: Response) => {
        const coachId = (req as any).user?.id || req.body.coachId;
        const { dataType, localRecords, serverRecords } = req.body;
        const check = await offlineSyncService.verifyDataIntegrity(coachId, dataType, localRecords, serverRecords);
        sendSuccess(res, check, 'Data integrity verified successfully');
    });

    // ==================== Offline Records ====================

    storeOfflineAttendance = asyncHandler(async (req: Request, res: Response) => {
        const coachId = (req as any).user?.id || req.body.coachId;
        const record = await offlineSyncService.storeOfflineAttendance(coachId, req.body);
        sendSuccess(res, record, 'Offline attendance stored successfully', 201);
    });

    storeOfflineSkillLog = asyncHandler(async (req: Request, res: Response) => {
        const coachId = (req as any).user?.id || req.body.coachId;
        const record = await offlineSyncService.storeOfflineSkillLog(coachId, req.body);
        sendSuccess(res, record, 'Offline skill log stored successfully', 201);
    });

    storeOfflineIncident = asyncHandler(async (req: Request, res: Response) => {
        const coachId = (req as any).user?.id || req.body.coachId;
        const record = await offlineSyncService.storeOfflineIncident(coachId, req.body);
        sendSuccess(res, record, 'Offline incident stored successfully', 201);
    });

    storeQRCheckIn = asyncHandler(async (req: Request, res: Response) => {
        const coachId = (req as any).user?.id || req.body.coachId;
        const record = await offlineSyncService.storeQRCheckIn(coachId, req.body);
        sendSuccess(res, record, 'QR check-in stored successfully', 201);
    });

    // ==================== Sync Configuration ====================

    setSyncConfig = asyncHandler(async (req: Request, res: Response) => {
        const coachId = (req as any).user?.id || req.body.coachId;
        const config = await offlineSyncService.setSyncConfig(coachId, req.body);
        sendSuccess(res, config, 'Sync configuration set successfully', 201);
    });

    getSyncConfig = asyncHandler(async (req: Request, res: Response) => {
        const { coachId } = req.params;
        const config = await offlineSyncService.getSyncConfig(coachId);
        sendSuccess(res, config, 'Sync configuration retrieved successfully');
    });

    // ==================== Event Logging & Statistics ====================

    getEventLogs = asyncHandler(async (req: Request, res: Response) => {
        const { coachId } = req.params;
        const { limit } = req.query;
        const logs = await offlineSyncService.getEventLogs(coachId, parseInt(limit as string) || 100);
        sendSuccess(res, logs, 'Event logs retrieved successfully');
    });

    getSyncStatistics = asyncHandler(async (req: Request, res: Response) => {
        const { coachId } = req.params;
        const { period } = req.query;
        const stats = await offlineSyncService.getSyncStatistics(coachId, (period as any) || 'daily');
        sendSuccess(res, stats, 'Sync statistics retrieved successfully');
    });
}
