import { Document } from 'mongoose';

export enum CheckInMethod {
    QR_CODE = 'qr_code',
    NFC_BADGE = 'nfc_badge',
    BIOMETRIC = 'biometric',
    MOBILE_APP = 'mobile_app',
    MANUAL = 'manual',
    FACIAL_RECOGNITION = 'facial_recognition',
    RFID = 'rfid'
}

export enum AttendanceType {
    STUDENT = 'student',
    STAFF = 'staff',
    VISITOR = 'visitor',
    PARENT = 'parent'
}

export enum AttendanceStatus {
    CHECKED_IN = 'checked_in',
    CHECKED_OUT = 'checked_out',
    PRESENT = 'present',
    ABSENT = 'absent',
    LATE = 'late',
    EARLY_DEPARTURE = 'early_departure',
    NO_SHOW = 'no_show'
}

export enum SessionType {
    CLASS = 'class',
    TRAINING = 'training',
    CAMP = 'camp',
    EVENT = 'event',
    ASSESSMENT = 'assessment',
    MAKEUP = 'makeup',
    TRIAL = 'trial'
}

export enum DeviceType {
    TABLET = 'tablet',
    SMARTPHONE = 'smartphone',
    KIOSK = 'kiosk',
    SCANNER = 'scanner',
    BIOMETRIC_READER = 'biometric_reader',
    NFC_READER = 'nfc_reader'
}

export enum SyncStatus {
    SYNCED = 'synced',
    PENDING = 'pending',
    FAILED = 'failed',
    OFFLINE = 'offline'
}

export interface ILocationCoordinates {
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number;
    heading?: number;
    speed?: number;
}

export interface IDeviceInfo {
    deviceId: string;
    deviceType: DeviceType;
    deviceName: string;
    operatingSystem: string;
    appVersion: string;
    isOnline: boolean;
    lastSyncAt?: Date;
    batteryLevel?: number;
    signalStrength?: number;
}

export interface IAttendanceRecord extends Document {
    // Basic Information
    attendanceId: string;
    attendanceType: AttendanceType;

    // Person Information
    personId: string; // Can be studentId, staffId, visitorId
    personName: string;
    personType: AttendanceType;

    // Session Information
    sessionId?: string;
    sessionType?: SessionType;
    sessionName?: string;
    classId?: string;
    className?: string;

    // Location Information
    locationId: string;
    roomId?: string;

    // Check-in Details
    checkInTime: Date;
    checkInMethod: CheckInMethod;
    checkInLocation?: ILocationCoordinates;
    checkInDeviceInfo: IDeviceInfo;
    checkInPhoto?: string;
    checkInNotes?: string;

    // Check-out Details
    checkOutTime?: Date;
    checkOutMethod?: CheckInMethod;
    checkOutLocation?: ILocationCoordinates;
    checkOutDeviceInfo?: IDeviceInfo;
    checkOutPhoto?: string;
    checkOutNotes?: string;

    // Status and Validation
    status: AttendanceStatus;
    isLate: boolean;
    lateMinutes?: number;
    isEarlyDeparture: boolean;
    earlyDepartureMinutes?: number;

    // Duration
    expectedDuration?: number; // in minutes
    actualDuration?: number; // in minutes

    // Verification
    verifiedBy?: string;
    verificationTime?: Date;
    requiresApproval: boolean;
    approvedBy?: string;
    approvedAt?: Date;

    // Parent/Guardian Information (for students)
    parentId?: string;
    parentName?: string;
    parentPhone?: string;
    authorizedPickupPersons?: {
        personId: string;
        name: string;
        relationship: string;
        phone: string;
        idVerified: boolean;
    }[];

    // Safety and Compliance
    temperatureCheck?: {
        temperature: number;
        unit: 'celsius' | 'fahrenheit';
        recordedAt: Date;
        recordedBy: string;
    };
    healthScreening?: {
        questions: {
            question: string;
            answer: boolean;
        }[];
        passed: boolean;
        recordedAt: Date;
    };

    // Offline Support
    syncStatus: SyncStatus;
    offlineRecordedAt?: Date;
    syncedAt?: Date;
    syncErrors?: string[];

    // Business Context
    businessUnitId: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAttendanceSession extends Document {
    // Session Information
    sessionId: string;
    sessionType: SessionType;
    sessionName: string;

    // Schedule Information
    scheduledStartTime: Date;
    scheduledEndTime: Date;
    actualStartTime?: Date;
    actualEndTime?: Date;

    // Location Information
    locationId: string;
    roomId?: string;

    // Capacity Information
    maxCapacity: number;
    currentAttendance: number;
    waitlistCount: number;

    // Staff Information
    instructorId?: string;
    instructorName?: string;
    assistantIds?: string[];

    // Attendance Tracking
    expectedAttendees: {
        personId: string;
        personName: string;
        personType: AttendanceType;
        isRequired: boolean;
    }[];

    actualAttendees: {
        personId: string;
        personName: string;
        personType: AttendanceType;
        checkInTime: Date;
        checkOutTime?: Date;
        status: AttendanceStatus;
    }[];

    // Session Status
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    cancellationReason?: string;

    // Notes and Observations
    sessionNotes?: string;
    attendanceNotes?: string;

    // Business Context
    businessUnitId: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAttendanceDevice extends Document {
    // Device Information
    deviceId: string;
    deviceName: string;
    deviceType: DeviceType;

    // Location Assignment
    locationId: string;
    roomId?: string;
    isPortable: boolean;

    // Configuration
    supportedMethods: CheckInMethod[];
    requiresInternet: boolean;
    offlineCapacity: number;

    // Status
    isActive: boolean;
    isOnline: boolean;
    lastHeartbeat?: Date;
    batteryLevel?: number;

    // Settings
    settings: {
        autoCheckOut: boolean;
        autoCheckOutMinutes?: number;
        requirePhoto: boolean;
        requireLocation: boolean;
        requireHealthScreening: boolean;
        allowOfflineMode: boolean;
        syncInterval: number; // in minutes
    };

    // Statistics
    statistics: {
        totalCheckIns: number;
        totalCheckOuts: number;
        averageCheckInTime: number;
        lastUsedAt?: Date;
        errorCount: number;
        uptime: number;
    };

    // Business Context
    businessUnitId: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAttendanceRule extends Document {
    // Rule Information
    ruleId: string;
    ruleName: string;
    description?: string;

    // Rule Conditions
    applicableTypes: AttendanceType[];
    locationIds: string[];
    sessionTypes?: SessionType[];

    // Time Rules
    allowEarlyCheckIn: boolean;
    earlyCheckInMinutes?: number;
    allowLateCheckIn: boolean;
    lateCheckInMinutes?: number;
    autoCheckOut: boolean;
    autoCheckOutMinutes?: number;

    // Validation Rules
    requireParentApproval: boolean;
    requireStaffVerification: boolean;
    requirePhoto: boolean;
    requireLocation: boolean;
    requireHealthScreening: boolean;

    // Notification Rules
    notifyOnCheckIn: boolean;
    notifyOnCheckOut: boolean;
    notifyOnLate: boolean;
    notifyOnNoShow: boolean;
    notificationRecipients: string[];

    // Safety Rules
    requireAuthorizedPickup: boolean;
    requireIdVerification: boolean;
    maxSessionDuration?: number; // in minutes

    // Status
    isActive: boolean;
    priority: number;

    // Business Context
    businessUnitId: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Request/Response Interfaces
export interface ICheckInRequest {
    personId: string;
    personType: AttendanceType;
    locationId: string;
    roomId?: string;
    sessionId?: string;
    checkInMethod: CheckInMethod;
    deviceInfo: IDeviceInfo;
    location?: ILocationCoordinates;
    photo?: string;
    notes?: string;
    temperatureCheck?: {
        temperature: number;
        unit: 'celsius' | 'fahrenheit';
    };
    healthScreening?: {
        questions: {
            question: string;
            answer: boolean;
        }[];
    };
}

export interface ICheckOutRequest {
    attendanceId: string;
    checkOutMethod: CheckInMethod;
    deviceInfo: IDeviceInfo;
    location?: ILocationCoordinates;
    photo?: string;
    notes?: string;
    pickupPersonId?: string;
    pickupPersonName?: string;
    pickupPersonRelationship?: string;
    idVerified?: boolean;
}

export interface IAttendanceFilter {
    attendanceType?: AttendanceType;
    personId?: string;
    locationId?: string;
    roomId?: string;
    sessionId?: string;
    status?: AttendanceStatus;
    dateRange?: {
        startDate: Date;
        endDate: Date;
    };
    checkInMethod?: CheckInMethod;
    isLate?: boolean;
    syncStatus?: SyncStatus;
}

export interface IAttendanceStatistics {
    totalRecords: number;
    checkInCount: number;
    checkOutCount: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    noShowCount: number;
    averageSessionDuration: number;
    attendanceRate: number;
    punctualityRate: number;

    // By Type
    attendanceByType: Record<AttendanceType, number>;
    attendanceByMethod: Record<CheckInMethod, number>;
    attendanceByLocation: {
        locationId: string;
        locationName: string;
        attendanceCount: number;
        attendanceRate: number;
    }[];

    // Trends
    dailyTrends: {
        date: Date;
        checkIns: number;
        checkOuts: number;
        lateArrivals: number;
    }[];

    // Peak Hours
    peakHours: {
        hour: number;
        checkInCount: number;
        checkOutCount: number;
    }[];
}

export interface ISessionAttendanceReport {
    sessionId: string;
    sessionName: string;
    sessionType: SessionType;
    scheduledStartTime: Date;
    scheduledEndTime: Date;

    // Capacity
    maxCapacity: number;
    expectedAttendees: number;
    actualAttendees: number;
    attendanceRate: number;

    // Attendance Breakdown
    presentCount: number;
    absentCount: number;
    lateCount: number;
    earlyDepartureCount: number;

    // Detailed Records
    attendanceRecords: {
        personId: string;
        personName: string;
        personType: AttendanceType;
        status: AttendanceStatus;
        checkInTime?: Date;
        checkOutTime?: Date;
        isLate: boolean;
        lateMinutes?: number;
    }[];
}

export interface IOfflineSync {
    deviceId: string;
    syncBatch: {
        batchId: string;
        recordCount: number;
        records: Partial<IAttendanceRecord>[];
        createdAt: Date;
    };
    syncResult: {
        successful: number;
        failed: number;
        errors: {
            recordIndex: number;
            error: string;
        }[];
    };
}