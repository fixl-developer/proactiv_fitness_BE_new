// Offline Sync Tests

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OfflineSyncService } from './offline-sync.service';
import { OfflineSyncController } from './offline-sync.controller';
import { Request, Response } from 'express';

describe('Offline Sync Module', () => {
    let service: OfflineSyncService;
    let controller: OfflineSyncController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        service = new OfflineSyncService();
        controller = new OfflineSyncController();

        mockRequest = {
            user: { id: 'coach-123' },
            params: {},
            body: {}
        };

        mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
            send: vi.fn().mockReturnThis()
        };
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Offline Mode Management', () => {
        it('should start offline mode', async () => {
            const result = await service.startOfflineMode('coach-123');

            expect(result).toBeDefined();
            expect(result.coachId).toBe('coach-123');
            expect(result.isOffline).toBe(true);
            expect(result.offlineSince).toBeDefined();
        });

        it('should end offline mode', async () => {
            await service.startOfflineMode('coach-123');
            const result = await service.endOfflineMode('coach-123');

            expect(result.isOffline).toBe(false);
            expect(result.lastSyncTime).toBeDefined();
        });

        it('should get offline mode status', async () => {
            await service.startOfflineMode('coach-123');
            const status = await service.getOfflineModeStatus('coach-123');

            expect(status).toBeDefined();
            expect(status.coachId).toBe('coach-123');
            expect(status.isOffline).toBe(true);
        });

        it('should throw error when getting status for non-existent coach', async () => {
            expect(async () => {
                await service.getOfflineModeStatus('non-existent');
            }).rejects.toThrow();
        });
    });

    describe('Data Storage', () => {
        it('should store offline data', async () => {
            const data = { classId: 'class-1', studentId: 'student-1' };
            const result = await service.storeOfflineData('coach-123', 'attendance', data);

            expect(result).toBeDefined();
            expect(result.coachId).toBe('coach-123');
            expect(result.dataType).toBe('attendance');
            expect(result.synced).toBe(false);
        });

        it('should retrieve offline data', async () => {
            await service.storeOfflineData('coach-123', 'attendance', { test: 'data' });
            const data = await service.getOfflineData('coach-123');

            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);
        });

        it('should filter offline data by sync status', async () => {
            await service.storeOfflineData('coach-123', 'attendance', { test: 'data' });
            const unsynced = await service.getOfflineData('coach-123', false);

            expect(unsynced.length).toBeGreaterThan(0);
            expect(unsynced[0].synced).toBe(false);
        });

        it('should clear offline data', async () => {
            await service.storeOfflineData('coach-123', 'attendance', { test: 'data' });
            await service.clearOfflineData('coach-123');
            const data = await service.getOfflineData('coach-123');

            expect(data.length).toBe(0);
        });
    });

    describe('Sync Queue Management', () => {
        it('should create sync queue', async () => {
            const items = [
                { dataType: 'attendance', data: { test: 'data' } },
                { dataType: 'skill', data: { test: 'data' } }
            ];
            const queue = await service.createSyncQueue('coach-123', items);

            expect(queue).toBeDefined();
            expect(queue.coachId).toBe('coach-123');
            expect(queue.totalItems).toBe(2);
            expect(queue.status).toBe('pending');
        });

        it('should get sync queue', async () => {
            const items = [{ dataType: 'attendance', data: { test: 'data' } }];
            const created = await service.createSyncQueue('coach-123', items);
            const queue = await service.getSyncQueue(created.queueId);

            expect(queue.queueId).toBe(created.queueId);
        });

        it('should update sync queue status', async () => {
            const items = [{ dataType: 'attendance', data: { test: 'data' } }];
            const queue = await service.createSyncQueue('coach-123', items);
            const updated = await service.updateSyncQueueStatus(queue.queueId, 'syncing');

            expect(updated.status).toBe('syncing');
            expect(updated.startedAt).toBeDefined();
        });

        it('should mark item as synced', async () => {
            const items = [{ dataType: 'attendance', data: { test: 'data' } }];
            const queue = await service.createSyncQueue('coach-123', items);
            const itemId = queue.items[0].itemId;
            const updated = await service.markItemSynced(queue.queueId, itemId);

            expect(updated.syncedItems).toBe(1);
            expect(updated.items[0].status).toBe('synced');
        });

        it('should mark item as failed', async () => {
            const items = [{ dataType: 'attendance', data: { test: 'data' } }];
            const queue = await service.createSyncQueue('coach-123', items);
            const itemId = queue.items[0].itemId;
            const updated = await service.markItemFailed(queue.queueId, itemId, 'Network error');

            expect(updated.failedItems).toBe(1);
            expect(updated.items[0].status).toBe('failed');
            expect(updated.items[0].error).toBe('Network error');
        });
    });

    describe('Conflict Detection & Resolution', () => {
        it('should detect conflict', async () => {
            const localData = { status: 'present' };
            const serverData = { status: 'absent' };
            const conflict = await service.detectConflict('coach-123', 'attendance', localData, serverData);

            expect(conflict).toBeDefined();
            expect(conflict.coachId).toBe('coach-123');
            expect(conflict.status).toBe('pending');
        });

        it('should get conflicts', async () => {
            const localData = { status: 'present' };
            const serverData = { status: 'absent' };
            await service.detectConflict('coach-123', 'attendance', localData, serverData);
            const conflicts = await service.getConflicts('coach-123');

            expect(Array.isArray(conflicts)).toBe(true);
            expect(conflicts.length).toBeGreaterThan(0);
        });

        it('should resolve conflict with local resolution', async () => {
            const localData = { status: 'present' };
            const serverData = { status: 'absent' };
            const conflict = await service.detectConflict('coach-123', 'attendance', localData, serverData);
            const resolved = await service.resolveConflict(conflict.conflictId, 'local');

            expect(resolved.status).toBe('resolved');
            expect(resolved.resolution).toBe('local');
        });

        it('should resolve conflict with server resolution', async () => {
            const localData = { status: 'present' };
            const serverData = { status: 'absent' };
            const conflict = await service.detectConflict('coach-123', 'attendance', localData, serverData);
            const resolved = await service.resolveConflict(conflict.conflictId, 'server');

            expect(resolved.resolution).toBe('server');
        });

        it('should resolve conflict with merged data', async () => {
            const localData = { status: 'present' };
            const serverData = { status: 'absent' };
            const conflict = await service.detectConflict('coach-123', 'attendance', localData, serverData);
            const mergedData = { status: 'late' };
            const resolved = await service.resolveConflict(conflict.conflictId, 'merged', mergedData);

            expect(resolved.resolution).toBe('merged');
            expect(resolved.localData).toEqual(mergedData);
        });
    });

    describe('Caching', () => {
        it('should cache students', async () => {
            const students = [
                { id: 'student-1', name: 'John', age: 10, qrCode: 'QR001' },
                { id: 'student-2', name: 'Jane', age: 11, qrCode: 'QR002' }
            ];
            const cached = await service.cacheStudents('coach-123', students);

            expect(Array.isArray(cached)).toBe(true);
            expect(cached.length).toBe(2);
            expect(cached[0].studentId).toBe('student-1');
        });

        it('should get cached students', async () => {
            const students = [
                { id: 'student-1', name: 'John', age: 10, qrCode: 'QR001' }
            ];
            await service.cacheStudents('coach-123', students);
            const cached = await service.getCachedStudents('coach-123');

            expect(cached.length).toBe(1);
            expect(cached[0].name).toBe('John');
        });

        it('should cache classes', async () => {
            const classes = [
                {
                    id: 'class-1',
                    name: 'Gymnastics 101',
                    programId: 'prog-1',
                    schedule: { day: 'Monday', startTime: '10:00', endTime: '11:00' }
                }
            ];
            const cached = await service.cacheClasses('coach-123', classes);

            expect(cached.length).toBe(1);
            expect(cached[0].className).toBe('Gymnastics 101');
        });

        it('should get cached classes', async () => {
            const classes = [
                {
                    id: 'class-1',
                    name: 'Gymnastics 101',
                    programId: 'prog-1',
                    schedule: { day: 'Monday', startTime: '10:00', endTime: '11:00' }
                }
            ];
            await service.cacheClasses('coach-123', classes);
            const cached = await service.getCachedClasses('coach-123');

            expect(cached.length).toBe(1);
        });
    });

    describe('Data Integrity', () => {
        it('should verify data integrity - passed', async () => {
            const check = await service.verifyDataIntegrity('coach-123', 'attendance', 10, 10);

            expect(check).toBeDefined();
            expect(check.status).toBe('passed');
            expect(check.missingRecords).toBe(0);
        });

        it('should verify data integrity - warning', async () => {
            const check = await service.verifyDataIntegrity('coach-123', 'attendance', 10, 8);

            expect(check.status).toBe('warning');
            expect(check.missingRecords).toBe(2);
        });
    });

    describe('Offline Records', () => {
        it('should store offline attendance', async () => {
            const attendance = {
                classId: 'class-1',
                studentId: 'student-1',
                status: 'present',
                notes: 'Good attendance'
            };
            const record = await service.storeOfflineAttendance('coach-123', attendance);

            expect(record).toBeDefined();
            expect(record.coachId).toBe('coach-123');
            expect(record.status).toBe('present');
        });

        it('should store offline skill log', async () => {
            const skillLog = {
                studentId: 'student-1',
                skillId: 'skill-1',
                level: 'intermediate',
                notes: 'Good progress'
            };
            const record = await service.storeOfflineSkillLog('coach-123', skillLog);

            expect(record).toBeDefined();
            expect(record.level).toBe('intermediate');
        });

        it('should store offline incident', async () => {
            const incident = {
                studentId: 'student-1',
                type: 'injury',
                description: 'Minor fall',
                severity: 'low'
            };
            const record = await service.storeOfflineIncident('coach-123', incident);

            expect(record).toBeDefined();
            expect(record.type).toBe('injury');
        });

        it('should store QR check-in', async () => {
            const checkIn = {
                studentId: 'student-1',
                classId: 'class-1',
                method: 'qr'
            };
            const record = await service.storeQRCheckIn('coach-123', checkIn);

            expect(record).toBeDefined();
            expect(record.method).toBe('qr');
        });
    });

    describe('Sync Configuration', () => {
        it('should set sync config', async () => {
            const config = {
                autoSync: true,
                syncInterval: 5,
                maxRetries: 3
            };
            const result = await service.setSyncConfig('coach-123', config);

            expect(result).toBeDefined();
            expect(result.autoSync).toBe(true);
            expect(result.syncInterval).toBe(5);
        });

        it('should get sync config', async () => {
            await service.setSyncConfig('coach-123', { autoSync: true });
            const config = await service.getSyncConfig('coach-123');

            expect(config).toBeDefined();
            expect(config.autoSync).toBe(true);
        });

        it('should get default sync config if not set', async () => {
            const config = await service.getSyncConfig('coach-456');

            expect(config).toBeDefined();
            expect(config.autoSync).toBe(true);
            expect(config.syncInterval).toBe(5);
        });
    });

    describe('Event Logging & Statistics', () => {
        it('should get event logs', async () => {
            await service.startOfflineMode('coach-123');
            const logs = await service.getEventLogs('coach-123');

            expect(Array.isArray(logs)).toBe(true);
            expect(logs.length).toBeGreaterThan(0);
        });

        it('should get sync statistics', async () => {
            await service.startOfflineMode('coach-123');
            const stats = await service.getSyncStatistics('coach-123', 'daily');

            expect(stats).toBeDefined();
            expect(stats.coachId).toBe('coach-123');
            expect(stats.period).toBe('daily');
        });
    });

    describe('Controller Integration', () => {
        it('should handle start offline mode request', async () => {
            mockRequest.body = { coachId: 'coach-123' };
            await controller.startOfflineMode(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalled();
        });

        it('should handle get offline mode status request', async () => {
            mockRequest.params = { coachId: 'coach-123' };
            await service.startOfflineMode('coach-123');
            await controller.getOfflineModeStatus(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalled();
        });

        it('should handle store offline data request', async () => {
            mockRequest.body = {
                coachId: 'coach-123',
                dataType: 'attendance',
                data: { test: 'data' }
            };
            await controller.storeOfflineData(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid coach ID', async () => {
            expect(async () => {
                await service.getOfflineModeStatus('');
            }).rejects.toThrow();
        });

        it('should handle invalid sync queue ID', async () => {
            expect(async () => {
                await service.getSyncQueue('invalid-id');
            }).rejects.toThrow();
        });

        it('should handle invalid conflict ID', async () => {
            expect(async () => {
                await service.resolveConflict('invalid-id', 'local');
            }).rejects.toThrow();
        });
    });

    describe('Data Validation', () => {
        it('should validate offline data type', async () => {
            const result = await service.storeOfflineData('coach-123', 'attendance', { test: 'data' });
            expect(['attendance', 'skill', 'incident', 'qr_checkin']).toContain(result.dataType);
        });

        it('should validate sync queue status', async () => {
            const items = [{ dataType: 'attendance', data: { test: 'data' } }];
            const queue = await service.createSyncQueue('coach-123', items);
            const updated = await service.updateSyncQueueStatus(queue.queueId, 'syncing');

            expect(['pending', 'syncing', 'completed', 'failed']).toContain(updated.status);
        });

        it('should validate conflict resolution', async () => {
            const conflict = await service.detectConflict('coach-123', 'attendance', {}, {});
            const resolved = await service.resolveConflict(conflict.conflictId, 'local');

            expect(['local', 'server', 'merged']).toContain(resolved.resolution);
        });
    });
});
