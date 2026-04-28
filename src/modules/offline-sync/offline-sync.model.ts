// Offline Sync Data Models

// Offline Data Storage Model
export interface IOfflineData {
    offlineDataId: string;
    coachId: string;
    dataType: 'attendance' | 'skill' | 'incident' | 'qr_checkin';
    data: any;
    timestamp: Date;
    synced: boolean;
    syncedAt?: Date;
    syncError?: string;
    retryCount: number;
    createdAt: Date;
    updatedAt: Date;
}

// Sync Queue Model
export interface ISyncQueue {
    queueId: string;
    coachId: string;
    items: SyncItem[];
    status: 'pending' | 'syncing' | 'completed' | 'failed';
    totalItems: number;
    syncedItems: number;
    failedItems: number;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    lastError?: string;
}

// Individual Sync Item
export interface SyncItem {
    itemId: string;
    dataType: 'attendance' | 'skill' | 'incident' | 'qr_checkin';
    data: any;
    status: 'pending' | 'synced' | 'failed';
    error?: string;
    timestamp: Date;
}

// Conflict Model
export interface IConflict {
    conflictId: string;
    coachId: string;
    dataType: string;
    localData: any;
    serverData: any;
    status: 'pending' | 'resolved' | 'manual_review';
    resolution?: 'local' | 'server' | 'merged';
    resolvedBy?: string;
    resolvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Offline Mode Status
export interface IOfflineModeStatus {
    statusId: string;
    coachId: string;
    isOffline: boolean;
    offlineSince?: Date;
    lastSyncTime?: Date;
    pendingItems: number;
    cachedStudents: number;
    cachedClasses: number;
    storageUsed: number; // in MB
    storageLimit: number; // in MB
    syncProgress: number; // 0-100
}

// Cached Student Data
export interface ICachedStudent {
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

// Cached Class Data
export interface ICachedClass {
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

// Sync Statistics
export interface ISyncStatistics {
    statsId: string;
    coachId: string;
    period: 'daily' | 'weekly' | 'monthly';
    totalSyncs: number;
    successfulSyncs: number;
    failedSyncs: number;
    averageSyncTime: number; // in ms
    totalDataSynced: number; // in MB
    conflictsResolved: number;
    lastSyncTime: Date;
    createdAt: Date;
}

// Data Integrity Check
export interface IDataIntegrityCheck {
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

// Offline Attendance Record
export interface IOfflineAttendance {
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

// Offline Skill Log
export interface IOfflineSkillLog {
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

// Offline Incident Report
export interface IOfflineIncident {
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

// QR Check-in Record
export interface IQRCheckIn {
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

// Sync Configuration
export interface ISyncConfig {
    configId: string;
    coachId: string;
    autoSync: boolean;
    syncInterval: number; // in minutes
    maxRetries: number;
    conflictResolutionStrategy: 'local' | 'server' | 'manual';
    cacheExpiry: number; // in hours
    maxCacheSize: number; // in MB
    enableDataCompression: boolean;
    enableEncryption: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Sync Event Log
export interface ISyncEventLog {
    eventId: string;
    coachId: string;
    eventType: 'sync_start' | 'sync_complete' | 'sync_failed' | 'conflict_detected' | 'data_verified';
    details: string;
    status: 'success' | 'failure' | 'warning';
    timestamp: Date;
    duration?: number; // in ms
    itemsProcessed?: number;
    createdAt: Date;
}
