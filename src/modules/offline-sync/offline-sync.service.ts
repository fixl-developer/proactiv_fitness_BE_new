// Offline Sync Service - Business Logic

import { IOfflineData, ISyncQueue, IConflict, IOfflineModeStatus, ICachedStudent, ICachedClass, ISyncStatistics, IDataIntegrityCheck, IOfflineAttendance, IOfflineSkillLog, IOfflineIncident, IQRCheckIn, ISyncConfig, ISyncEventLog } from './offline-sync.model';

export class OfflineSyncService {
    private offlineDataStore: Map<string, IOfflineData[]> = new Map();
    private syncQueues: Map<string, ISyncQueue> = new Map();
    private conflicts: Map<string, IConflict[]> = new Map();
    private offlineModeStatus: Map<string, IOfflineModeStatus> = new Map();
    private cachedStudents: Map<string, ICachedStudent[]> = new Map();
    private cachedClasses: Map<string, ICachedClass[]> = new Map();
    private syncConfigs: Map<string, ISyncConfig> = new Map();
    private eventLogs: Map<string, ISyncEventLog[]> = new Map();

    // ==================== Offline Mode Management ====================

    async startOfflineMode(coachId: string): Promise<IOfflineModeStatus> {
        const status: IOfflineModeStatus = {
            statusId: `status-${Date.now()}`,
            coachId,
            isOffline: true,
            offlineSince: new Date(),
            pendingItems: 0,
            cachedStudents: 0,
            cachedClasses: 0,
            storageUsed: 0,
            storageLimit: 500, // 500 MB
            syncProgress: 0
        };

        this.offlineModeStatus.set(coachId, status);
        await this.logEvent(coachId, 'sync_start', 'Offline mode started', 'success');
        return status;
    }

    async endOfflineMode(coachId: string): Promise<IOfflineModeStatus> {
        const status = this.offlineModeStatus.get(coachId);
        if (!status) throw new Error('Offline mode not active');

        status.isOffline = false;
        status.lastSyncTime = new Date();
        this.offlineModeStatus.set(coachId, status);
        await this.logEvent(coachId, 'sync_complete', 'Offline mode ended', 'success');
        return status;
    }

    async getOfflineModeStatus(coachId: string): Promise<IOfflineModeStatus> {
        const status = this.offlineModeStatus.get(coachId);
        if (!status) throw new Error('Offline mode not initialized');
        return status;
    }

    // ==================== Data Storage ====================

    async storeOfflineData(coachId: string, dataType: string, data: any): Promise<IOfflineData> {
        const offlineData: IOfflineData = {
            offlineDataId: `offline-${Date.now()}`,
            coachId,
            dataType: dataType as any,
            data,
            timestamp: new Date(),
            synced: false,
            retryCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        if (!this.offlineDataStore.has(coachId)) {
            this.offlineDataStore.set(coachId, []);
        }
        this.offlineDataStore.get(coachId)!.push(offlineData);

        // Update pending items count
        const status = this.offlineModeStatus.get(coachId);
        if (status) {
            status.pendingItems = this.offlineDataStore.get(coachId)!.length;
        }

        return offlineData;
    }

    async getOfflineData(coachId: string, synced?: boolean): Promise<IOfflineData[]> {
        const data = this.offlineDataStore.get(coachId) || [];
        if (synced !== undefined) {
            return data.filter(d => d.synced === synced);
        }
        return data;
    }

    async clearOfflineData(coachId: string): Promise<void> {
        this.offlineDataStore.delete(coachId);
        const status = this.offlineModeStatus.get(coachId);
        if (status) {
            status.pendingItems = 0;
        }
    }

    // ==================== Sync Queue Management ====================

    async createSyncQueue(coachId: string, items: any[]): Promise<ISyncQueue> {
        const queue: ISyncQueue = {
            queueId: `queue-${Date.now()}`,
            coachId,
            items: items.map((item, index) => ({
                itemId: `item-${index}`,
                dataType: item.dataType,
                data: item.data,
                status: 'pending',
                timestamp: new Date()
            })),
            status: 'pending',
            totalItems: items.length,
            syncedItems: 0,
            failedItems: 0,
            createdAt: new Date()
        };

        this.syncQueues.set(queue.queueId, queue);
        return queue;
    }

    async getSyncQueue(queueId: string): Promise<ISyncQueue> {
        const queue = this.syncQueues.get(queueId);
        if (!queue) throw new Error('Sync queue not found');
        return queue;
    }

    async updateSyncQueueStatus(queueId: string, status: 'pending' | 'syncing' | 'completed' | 'failed'): Promise<ISyncQueue> {
        const queue = this.syncQueues.get(queueId);
        if (!queue) throw new Error('Sync queue not found');

        queue.status = status;
        if (status === 'syncing') {
            queue.startedAt = new Date();
        } else if (status === 'completed' || status === 'failed') {
            queue.completedAt = new Date();
        }

        this.syncQueues.set(queueId, queue);
        return queue;
    }

    async markItemSynced(queueId: string, itemId: string): Promise<ISyncQueue> {
        const queue = this.syncQueues.get(queueId);
        if (!queue) throw new Error('Sync queue not found');

        const item = queue.items.find(i => i.itemId === itemId);
        if (item) {
            item.status = 'synced';
            queue.syncedItems++;
        }

        this.syncQueues.set(queueId, queue);
        return queue;
    }

    async markItemFailed(queueId: string, itemId: string, error: string): Promise<ISyncQueue> {
        const queue = this.syncQueues.get(queueId);
        if (!queue) throw new Error('Sync queue not found');

        const item = queue.items.find(i => i.itemId === itemId);
        if (item) {
            item.status = 'failed';
            item.error = error;
            queue.failedItems++;
        }

        this.syncQueues.set(queueId, queue);
        return queue;
    }

    // ==================== Conflict Detection & Resolution ====================

    async detectConflict(coachId: string, dataType: string, localData: any, serverData: any): Promise<IConflict> {
        const conflict: IConflict = {
            conflictId: `conflict-${Date.now()}`,
            coachId,
            dataType,
            localData,
            serverData,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        if (!this.conflicts.has(coachId)) {
            this.conflicts.set(coachId, []);
        }
        this.conflicts.get(coachId)!.push(conflict);

        await this.logEvent(coachId, 'conflict_detected', `Conflict detected for ${dataType}`, 'warning');
        return conflict;
    }

    async getConflicts(coachId: string, status?: string): Promise<IConflict[]> {
        const conflicts = this.conflicts.get(coachId) || [];
        if (status) {
            return conflicts.filter(c => c.status === status);
        }
        return conflicts;
    }

    async resolveConflict(conflictId: string, resolution: 'local' | 'server' | 'merged', mergedData?: any): Promise<IConflict> {
        for (const [, conflicts] of this.conflicts) {
            const conflict = conflicts.find(c => c.conflictId === conflictId);
            if (conflict) {
                conflict.status = 'resolved';
                conflict.resolution = resolution;
                conflict.resolvedAt = new Date();
                if (resolution === 'merged' && mergedData) {
                    conflict.localData = mergedData;
                }
                return conflict;
            }
        }
        throw new Error('Conflict not found');
    }

    // ==================== Caching ====================

    async cacheStudents(coachId: string, students: any[]): Promise<ICachedStudent[]> {
        const cached: ICachedStudent[] = students.map((student, index) => ({
            cachedId: `cached-student-${index}`,
            coachId,
            studentId: student.id,
            name: student.name,
            age: student.age,
            enrolledPrograms: student.programs || [],
            qrCode: student.qrCode,
            photo: student.photo,
            cachedAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }));

        this.cachedStudents.set(coachId, cached);
        const status = this.offlineModeStatus.get(coachId);
        if (status) {
            status.cachedStudents = cached.length;
        }

        return cached;
    }

    async getCachedStudents(coachId: string): Promise<ICachedStudent[]> {
        const cached = this.cachedStudents.get(coachId) || [];
        return cached.filter(c => c.expiresAt > new Date());
    }

    async cacheClasses(coachId: string, classes: any[]): Promise<ICachedClass[]> {
        const cached: ICachedClass[] = classes.map((cls, index) => ({
            cachedId: `cached-class-${index}`,
            coachId,
            classId: cls.id,
            className: cls.name,
            programId: cls.programId,
            schedule: cls.schedule,
            students: cls.students || [],
            cachedAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }));

        this.cachedClasses.set(coachId, cached);
        const status = this.offlineModeStatus.get(coachId);
        if (status) {
            status.cachedClasses = cached.length;
        }

        return cached;
    }

    async getCachedClasses(coachId: string): Promise<ICachedClass[]> {
        const cached = this.cachedClasses.get(coachId) || [];
        return cached.filter(c => c.expiresAt > new Date());
    }

    // ==================== Data Integrity ====================

    async verifyDataIntegrity(coachId: string, dataType: string, localRecords: number, serverRecords: number): Promise<IDataIntegrityCheck> {
        const check: IDataIntegrityCheck = {
            checkId: `check-${Date.now()}`,
            coachId,
            dataType,
            localRecords,
            serverRecords,
            matchingRecords: Math.min(localRecords, serverRecords),
            missingRecords: Math.abs(localRecords - serverRecords),
            duplicateRecords: 0,
            status: localRecords === serverRecords ? 'passed' : 'warning',
            checkTime: new Date(),
            details: `Local: ${localRecords}, Server: ${serverRecords}`
        };

        await this.logEvent(coachId, 'data_verified', `Data integrity check for ${dataType}`, check.status === 'passed' ? 'success' : 'warning');
        return check;
    }

    // ==================== Offline Records ====================

    async storeOfflineAttendance(coachId: string, attendance: any): Promise<IOfflineAttendance> {
        const record: IOfflineAttendance = {
            attendanceId: `att-${Date.now()}`,
            coachId,
            classId: attendance.classId,
            studentId: attendance.studentId,
            status: attendance.status,
            timestamp: new Date(),
            notes: attendance.notes,
            synced: false,
            createdAt: new Date()
        };

        await this.storeOfflineData(coachId, 'attendance', record);
        return record;
    }

    async storeOfflineSkillLog(coachId: string, skillLog: any): Promise<IOfflineSkillLog> {
        const record: IOfflineSkillLog = {
            skillLogId: `skill-${Date.now()}`,
            coachId,
            studentId: skillLog.studentId,
            skillId: skillLog.skillId,
            level: skillLog.level,
            notes: skillLog.notes,
            timestamp: new Date(),
            synced: false,
            createdAt: new Date()
        };

        await this.storeOfflineData(coachId, 'skill', record);
        return record;
    }

    async storeOfflineIncident(coachId: string, incident: any): Promise<IOfflineIncident> {
        const record: IOfflineIncident = {
            incidentId: `incident-${Date.now()}`,
            coachId,
            studentId: incident.studentId,
            type: incident.type,
            description: incident.description,
            severity: incident.severity,
            timestamp: new Date(),
            actionTaken: incident.actionTaken,
            synced: false,
            createdAt: new Date()
        };

        await this.storeOfflineData(coachId, 'incident', record);
        return record;
    }

    async storeQRCheckIn(coachId: string, checkIn: any): Promise<IQRCheckIn> {
        const record: IQRCheckIn = {
            checkInId: `checkin-${Date.now()}`,
            coachId,
            studentId: checkIn.studentId,
            classId: checkIn.classId,
            timestamp: new Date(),
            method: checkIn.method || 'qr',
            synced: false,
            createdAt: new Date()
        };

        await this.storeOfflineData(coachId, 'qr_checkin', record);
        return record;
    }

    // ==================== Sync Configuration ====================

    async setSyncConfig(coachId: string, config: Partial<ISyncConfig>): Promise<ISyncConfig> {
        const syncConfig: ISyncConfig = {
            configId: `config-${Date.now()}`,
            coachId,
            autoSync: config.autoSync ?? true,
            syncInterval: config.syncInterval ?? 5,
            maxRetries: config.maxRetries ?? 3,
            conflictResolutionStrategy: config.conflictResolutionStrategy ?? 'manual',
            cacheExpiry: config.cacheExpiry ?? 24,
            maxCacheSize: config.maxCacheSize ?? 500,
            enableDataCompression: config.enableDataCompression ?? true,
            enableEncryption: config.enableEncryption ?? true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.syncConfigs.set(coachId, syncConfig);
        return syncConfig;
    }

    async getSyncConfig(coachId: string): Promise<ISyncConfig> {
        const config = this.syncConfigs.get(coachId);
        if (!config) {
            return this.setSyncConfig(coachId, {});
        }
        return config;
    }

    // ==================== Event Logging ====================

    private async logEvent(coachId: string, eventType: string, details: string, status: 'success' | 'failure' | 'warning'): Promise<ISyncEventLog> {
        const event: ISyncEventLog = {
            eventId: `event-${Date.now()}`,
            coachId,
            eventType: eventType as any,
            details,
            status,
            timestamp: new Date(),
            createdAt: new Date()
        };

        if (!this.eventLogs.has(coachId)) {
            this.eventLogs.set(coachId, []);
        }
        this.eventLogs.get(coachId)!.push(event);

        return event;
    }

    async getEventLogs(coachId: string, limit: number = 100): Promise<ISyncEventLog[]> {
        const logs = this.eventLogs.get(coachId) || [];
        return logs.slice(-limit);
    }

    // ==================== Sync Statistics ====================

    async getSyncStatistics(coachId: string, period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<ISyncStatistics> {
        const logs = this.eventLogs.get(coachId) || [];
        const successfulSyncs = logs.filter(l => l.status === 'success').length;
        const failedSyncs = logs.filter(l => l.status === 'failure').length;
        const totalSyncs = successfulSyncs + failedSyncs;

        return {
            statsId: `stats-${Date.now()}`,
            coachId,
            period,
            totalSyncs,
            successfulSyncs,
            failedSyncs,
            averageSyncTime: 150, // ms
            totalDataSynced: 0,
            conflictsResolved: (this.conflicts.get(coachId) || []).filter(c => c.status === 'resolved').length,
            lastSyncTime: new Date(),
            createdAt: new Date()
        };
    }
}
