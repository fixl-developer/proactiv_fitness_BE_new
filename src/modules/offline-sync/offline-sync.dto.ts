// Offline Sync DTOs

// Request DTOs
export class StartOfflineModeDTO {
    coachId: string;
}

export class EndOfflineModeDTO {
    coachId: string;
}

export class StoreOfflineDataDTO {
    coachId: string;
    dataType: 'attendance' | 'skill' | 'incident' | 'qr_checkin';
    data: any;
}

export class CreateSyncQueueDTO {
    coachId: string;
    items: Array<{
        dataType: string;
        data: any;
    }>;
}

export class UpdateSyncQueueStatusDTO {
    status: 'pending' | 'syncing' | 'completed' | 'failed';
}

export class DetectConflictDTO {
    coachId: string;
    dataType: string;
    localData: any;
    serverData: any;
}

export class ResolveConflictDTO {
    resolution: 'local' | 'server' | 'merged';
    mergedData?: any;
}

export class CacheStudentsDTO {
    coachId: string;
    students: Array<{
        id: string;
        name: string;
        age: number;
        programs?: string[];
        qrCode: string;
        photo?: string;
    }>;
}

export class CacheClassesDTO {
    coachId: string;
    classes: Array<{
        id: string;
        name: string;
        programId: string;
        schedule: {
            day: string;
            startTime: string;
            endTime: string;
        };
        students?: string[];
    }>;
}

export class VerifyDataIntegrityDTO {
    coachId: string;
    dataType: string;
    localRecords: number;
    serverRecords: number;
}

export class StoreOfflineAttendanceDTO {
    coachId: string;
    classId: string;
    studentId: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    notes?: string;
}

export class StoreOfflineSkillLogDTO {
    coachId: string;
    studentId: string;
    skillId: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    notes?: string;
}

export class StoreOfflineIncidentDTO {
    coachId: string;
    studentId: string;
    type: 'injury' | 'behavior' | 'safety' | 'other';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    actionTaken?: string;
}

export class StoreQRCheckInDTO {
    coachId: string;
    studentId: string;
    classId: string;
    method?: 'qr' | 'manual' | 'biometric';
}

export class SetSyncConfigDTO {
    coachId: string;
    autoSync?: boolean;
    syncInterval?: number;
    maxRetries?: number;
    conflictResolutionStrategy?: 'local' | 'server' | 'manual';
    cacheExpiry?: number;
    maxCacheSize?: number;
    enableDataCompression?: boolean;
    enableEncryption?: boolean;
}

// Response DTOs
export class OfflineModeStatusResponseDTO {
    statusId: string;
    coachId: string;
    isOffline: boolean;
    offlineSince?: Date;
    lastSyncTime?: Date;
    pendingItems: number;
    cachedStudents: number;
    cachedClasses: number;
    storageUsed: number;
    storageLimit: number;
    syncProgress: number;
}

export class OfflineDataResponseDTO {
    offlineDataId: string;
    coachId: string;
    dataType: string;
    data: any;
    timestamp: Date;
    synced: boolean;
    syncedAt?: Date;
    retryCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export class SyncQueueResponseDTO {
    queueId: string;
    coachId: string;
    items: Array<{
        itemId: string;
        dataType: string;
        status: 'pending' | 'synced' | 'failed';
        error?: string;
    }>;
    status: 'pending' | 'syncing' | 'completed' | 'failed';
    totalItems: number;
    syncedItems: number;
    failedItems: number;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
}

export class ConflictResponseDTO {
    conflictId: string;
    coachId: string;
    dataType: string;
    localData: any;
    serverData: any;
    status: 'pending' | 'resolved' | 'manual_review';
    resolution?: 'local' | 'server' | 'merged';
    resolvedAt?: Date;
    createdAt: Date;
}

export class CachedStudentResponseDTO {
    cachedId: string;
    coachId: string;
    studentId: string;
    name: string;
    age: number;
    enrolledPrograms: string[];
    qrCode: string;
    photo?: string;
    cachedAt: Date;
    expiresAt: Date;
}

export class CachedClassResponseDTO {
    cachedId: string;
    coachId: string;
    classId: string;
    className: string;
    programId: string;
    schedule: {
        day: string;
        startTime: string;
        endTime: string;
    };
    students: string[];
    cachedAt: Date;
    expiresAt: Date;
}

export class DataIntegrityCheckResponseDTO {
    checkId: string;
    coachId: string;
    dataType: string;
    localRecords: number;
    serverRecords: number;
    matchingRecords: number;
    missingRecords: number;
    duplicateRecords: number;
    status: 'passed' | 'failed' | 'warning';
    checkTime: Date;
    details: string;
}

export class OfflineAttendanceResponseDTO {
    attendanceId: string;
    coachId: string;
    classId: string;
    studentId: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    timestamp: Date;
    notes?: string;
    synced: boolean;
    syncedAt?: Date;
    createdAt: Date;
}

export class OfflineSkillLogResponseDTO {
    skillLogId: string;
    coachId: string;
    studentId: string;
    skillId: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    notes?: string;
    timestamp: Date;
    synced: boolean;
    syncedAt?: Date;
    createdAt: Date;
}

export class OfflineIncidentResponseDTO {
    incidentId: string;
    coachId: string;
    studentId: string;
    type: 'injury' | 'behavior' | 'safety' | 'other';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
    actionTaken?: string;
    synced: boolean;
    syncedAt?: Date;
    createdAt: Date;
}

export class QRCheckInResponseDTO {
    checkInId: string;
    coachId: string;
    studentId: string;
    classId: string;
    timestamp: Date;
    method: 'qr' | 'manual' | 'biometric';
    synced: boolean;
    syncedAt?: Date;
    createdAt: Date;
}

export class SyncConfigResponseDTO {
    configId: string;
    coachId: string;
    autoSync: boolean;
    syncInterval: number;
    maxRetries: number;
    conflictResolutionStrategy: 'local' | 'server' | 'manual';
    cacheExpiry: number;
    maxCacheSize: number;
    enableDataCompression: boolean;
    enableEncryption: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class SyncEventLogResponseDTO {
    eventId: string;
    coachId: string;
    eventType: string;
    details: string;
    status: 'success' | 'failure' | 'warning';
    timestamp: Date;
    duration?: number;
    itemsProcessed?: number;
    createdAt: Date;
}

export class SyncStatisticsResponseDTO {
    statsId: string;
    coachId: string;
    period: 'daily' | 'weekly' | 'monthly';
    totalSyncs: number;
    successfulSyncs: number;
    failedSyncs: number;
    averageSyncTime: number;
    totalDataSynced: number;
    conflictsResolved: number;
    lastSyncTime: Date;
    createdAt: Date;
}
