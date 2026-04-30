// Offline Sync Routes

import { Router } from 'express';
import { OfflineSyncController } from './offline-sync.controller';

const router = Router();
const controller = new OfflineSyncController();

// ==================== Offline Mode Management ====================
router.post('/mode/start', controller.startOfflineMode);
router.post('/mode/end', controller.endOfflineMode);
router.get('/mode/status/:coachId', controller.getOfflineModeStatus);

// ==================== Data Storage ====================
router.post('/data/store', controller.storeOfflineData);
router.get('/data/:coachId', controller.getOfflineData);
router.delete('/data/:coachId', controller.clearOfflineData);

// ==================== Sync Queue Management ====================
router.post('/queue/create', controller.createSyncQueue);
router.get('/queue/:queueId', controller.getSyncQueue);
router.put('/queue/:queueId/status', controller.updateSyncQueueStatus);
router.put('/queue/:queueId/item/:itemId/synced', controller.markItemSynced);
router.put('/queue/:queueId/item/:itemId/failed', controller.markItemFailed);

// ==================== Conflict Detection & Resolution ====================
router.post('/conflicts/detect', controller.detectConflict);
router.get('/conflicts/:coachId', controller.getConflicts);
router.put('/conflicts/:conflictId/resolve', controller.resolveConflict);

// ==================== Caching ====================
router.post('/cache/students', controller.cacheStudents);
router.get('/cache/students/:coachId', controller.getCachedStudents);
router.post('/cache/classes', controller.cacheClasses);
router.get('/cache/classes/:coachId', controller.getCachedClasses);

// ==================== Data Integrity ====================
router.post('/integrity/verify', controller.verifyDataIntegrity);

// ==================== Offline Records ====================
router.post('/records/attendance', controller.storeOfflineAttendance);
router.post('/records/skill', controller.storeOfflineSkillLog);
router.post('/records/incident', controller.storeOfflineIncident);
router.post('/records/checkin', controller.storeQRCheckIn);

// ==================== Sync Configuration ====================
router.post('/config/:coachId', controller.setSyncConfig);
router.get('/config/:coachId', controller.getSyncConfig);

// ==================== Event Logging & Statistics ====================
router.get('/logs/:coachId', controller.getEventLogs);
router.get('/statistics/:coachId', controller.getSyncStatistics);

export default router;
