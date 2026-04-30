import { Schema, model } from 'mongoose';
import {
    IAttendanceRecord,
    IAttendanceSession,
    IAttendanceDevice,
    IAttendanceRule,
    CheckInMethod,
    AttendanceType,
    AttendanceStatus,
    SessionType,
    DeviceType,
    SyncStatus
} from './attendance.interface';
import { baseSchemaOptions } from '../../shared/base/base.model';

// Location Coordinates Schema
const locationCoordinatesSchema = new Schema({
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    accuracy: { type: Number, min: 0 },
    altitude: Number,
    heading: { type: Number, min: 0, max: 360 },
    speed: { type: Number, min: 0 }
});

// Device Info Schema
const deviceInfoSchema = new Schema({
    // @ts-ignore - Mongoose type issue
    deviceId: { type: String, required: true, trim: true },
    deviceType: { type: String, enum: Object.values(DeviceType), required: true },
    deviceName: { type: String, required: true, trim: true },
    operatingSystem: { type: String, required: true, trim: true },
    appVersion: { type: String, required: true, trim: true },
    isOnline: { type: Boolean, default: true },
    lastSyncAt: Date,
    batteryLevel: { type: Number, min: 0, max: 100 },
    signalStrength: { type: Number, min: 0, max: 100 }
});

// Temperature Check Schema
const temperatureCheckSchema = new Schema({
    temperature: { type: Number, required: true, min: 30, max: 50 },
    unit: { type: String, enum: ['celsius', 'fahrenheit'], required: true },
    recordedAt: { type: Date, required: true },
    recordedBy: { type: String, required: true }
});

// Health Screening Schema
const healthScreeningSchema = new Schema({
    questions: [{
        question: { type: String, required: true, trim: true },
        answer: { type: Boolean, required: true }
    }],
    passed: { type: Boolean, required: true },
    recordedAt: { type: Date, required: true }
});

// Authorized Pickup Person Schema
const authorizedPickupPersonSchema = new Schema({
    personId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    relationship: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    idVerified: { type: Boolean, default: false }
});

// Attendance Record Schema
const attendanceRecordSchema = new Schema<IAttendanceRecord>({
    // Basic Information
    attendanceId: { type: String, required: true, unique: true, index: true },
    attendanceType: { type: String, enum: Object.values(AttendanceType), required: true, index: true },

    // Person Information
    personId: { type: String, required: true, index: true },
    personName: { type: String, required: true, trim: true },
    personType: { type: String, enum: Object.values(AttendanceType), required: true },

    // Session Information
    sessionId: { type: String, index: true },
    sessionType: { type: String, enum: Object.values(SessionType) },
    sessionName: { type: String, trim: true },
    classId: { type: String, index: true },
    className: { type: String, trim: true },

    // Location Information
    locationId: { type: String, ref: 'Location', required: true, index: true },
    // @ts-ignore - Mongoose type issue
    roomId: { type: String, ref: 'Room' },

    // Check-in Details
    checkInTime: { type: Date, required: true, index: true },
    checkInMethod: { type: String, enum: Object.values(CheckInMethod), required: true },
    checkInLocation: locationCoordinatesSchema,
    checkInDeviceInfo: { type: deviceInfoSchema, required: true },
    checkInPhoto: { type: String, trim: true },
    checkInNotes: { type: String, trim: true },

    // Check-out Details
    checkOutTime: { type: Date, index: true },
    checkOutMethod: { type: String, enum: Object.values(CheckInMethod) },
    checkOutLocation: locationCoordinatesSchema,
    checkOutDeviceInfo: deviceInfoSchema,
    checkOutPhoto: { type: String, trim: true },
    checkOutNotes: { type: String, trim: true },

    // Status and Validation
    status: { type: String, enum: Object.values(AttendanceStatus), default: AttendanceStatus.CHECKED_IN, index: true },
    isLate: { type: Boolean, default: false, index: true },
    lateMinutes: { type: Number, min: 0 },
    isEarlyDeparture: { type: Boolean, default: false },
    earlyDepartureMinutes: { type: Number, min: 0 },

    // Duration
    expectedDuration: { type: Number, min: 0 },
    actualDuration: { type: Number, min: 0 },

    // Verification
    verifiedBy: { type: String, ref: 'User' },
    verificationTime: Date,
    requiresApproval: { type: Boolean, default: false },
    approvedBy: { type: String, ref: 'User' },
    approvedAt: Date,

    // Parent/Guardian Information
    // @ts-ignore - Mongoose type issue
    parentId: { type: String, index: true },
    parentName: { type: String, trim: true },
    parentPhone: { type: String, trim: true },
    authorizedPickupPersons: [authorizedPickupPersonSchema],

    // Safety and Compliance
    temperatureCheck: temperatureCheckSchema,
    healthScreening: healthScreeningSchema,

    // Offline Support
    syncStatus: { type: String, enum: Object.values(SyncStatus), default: SyncStatus.SYNCED, index: true },
    offlineRecordedAt: Date,
    syncedAt: Date,
    syncErrors: [String],

    // Business Context
    businessUnitId: { type: String, ref: 'BusinessUnit', required: true, index: true },

    // Audit
    createdBy: { type: String, ref: 'User', required: true },
    updatedBy: { type: String, ref: 'User', required: true }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Attendance Session Schema
const attendanceSessionSchema = new Schema<IAttendanceSession>({
    // Session Information
    // @ts-ignore - Mongoose type issue
    sessionId: { type: String, required: true, unique: true, index: true },
    sessionType: { type: String, enum: Object.values(SessionType), required: true, index: true },
    sessionName: { type: String, required: true, trim: true },

    // Schedule Information
    scheduledStartTime: { type: Date, required: true, index: true },
    scheduledEndTime: { type: Date, required: true },
    actualStartTime: Date,
    actualEndTime: Date,

    // Location Information
    locationId: { type: String, ref: 'Location', required: true, index: true },
    // @ts-ignore - Mongoose type issue
    roomId: { type: String, ref: 'Room' },

    // Capacity Information
    maxCapacity: { type: Number, required: true, min: 1 },
    currentAttendance: { type: Number, default: 0, min: 0 },
    waitlistCount: { type: Number, default: 0, min: 0 },

    // Staff Information
    // @ts-ignore - Mongoose type issue
    instructorId: { type: String, index: true },
    instructorName: { type: String, trim: true },
    assistantIds: [String],

    // Attendance Tracking
    expectedAttendees: [{
        personId: { type: String, required: true },
        personName: { type: String, required: true, trim: true },
        personType: { type: String, enum: Object.values(AttendanceType), required: true },
        isRequired: { type: Boolean, default: true }
    }],

    actualAttendees: [{
        personId: { type: String, required: true },
        personName: { type: String, required: true, trim: true },
        personType: { type: String, enum: Object.values(AttendanceType), required: true },
        checkInTime: { type: Date, required: true },
        checkOutTime: Date,
        status: { type: String, enum: Object.values(AttendanceStatus), required: true }
    }],

    // Session Status
    status: { type: String, enum: ['scheduled', 'in_progress', 'completed', 'cancelled'], default: 'scheduled', index: true },
    cancellationReason: { type: String, trim: true },

    // Notes and Observations
    sessionNotes: { type: String, trim: true },
    attendanceNotes: { type: String, trim: true },

    // Business Context
    businessUnitId: { type: String, ref: 'BusinessUnit', required: true, index: true },

    // Audit
    createdBy: { type: String, ref: 'User', required: true },
    updatedBy: { type: String, ref: 'User', required: true }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Attendance Device Schema
const attendanceDeviceSchema = new Schema<IAttendanceDevice>({
    // Device Information
    // @ts-ignore - Mongoose type issue
    deviceId: { type: String, required: true, unique: true, index: true },
    deviceName: { type: String, required: true, trim: true },
    deviceType: { type: String, enum: Object.values(DeviceType), required: true },

    // Location Assignment
    locationId: { type: String, ref: 'Location', required: true, index: true },
    // @ts-ignore - Mongoose type issue
    roomId: { type: String, ref: 'Room' },
    isPortable: { type: Boolean, default: false },

    // Configuration
    supportedMethods: [{ type: String, enum: Object.values(CheckInMethod) }],
    requiresInternet: { type: Boolean, default: true },
    offlineCapacity: { type: Number, default: 1000, min: 0 },

    // Status
    isActive: { type: Boolean, default: true, index: true },
    isOnline: { type: Boolean, default: false, index: true },
    lastHeartbeat: Date,
    batteryLevel: { type: Number, min: 0, max: 100 },

    // Settings
    settings: {
        autoCheckOut: { type: Boolean, default: false },
        autoCheckOutMinutes: { type: Number, min: 1 },
        requirePhoto: { type: Boolean, default: false },
        requireLocation: { type: Boolean, default: false },
        requireHealthScreening: { type: Boolean, default: false },
        allowOfflineMode: { type: Boolean, default: true },
        syncInterval: { type: Number, default: 5, min: 1 }
    },

    // Statistics
    statistics: {
        totalCheckIns: { type: Number, default: 0, min: 0 },
        totalCheckOuts: { type: Number, default: 0, min: 0 },
        averageCheckInTime: { type: Number, default: 0, min: 0 },
        lastUsedAt: Date,
        errorCount: { type: Number, default: 0, min: 0 },
        uptime: { type: Number, default: 0, min: 0 }
    },

    // Business Context
    // @ts-ignore - Mongoose type issue
    businessUnitId: { type: String, ref: 'BusinessUnit', required: true, index: true },

    // Audit
    createdBy: { type: String, ref: 'User', required: true },
    updatedBy: { type: String, ref: 'User', required: true }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Attendance Rule Schema
const attendanceRuleSchema = new Schema<IAttendanceRule>({
    // Rule Information
    // @ts-ignore - Mongoose type issue
    ruleId: { type: String, required: true, unique: true, index: true },
    ruleName: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // Rule Conditions
    applicableTypes: [{ type: String, enum: Object.values(AttendanceType) }],
    locationIds: [{ type: String, ref: 'Location' }],
    sessionTypes: [{ type: String, enum: Object.values(SessionType) }],

    // Time Rules
    allowEarlyCheckIn: { type: Boolean, default: true },
    earlyCheckInMinutes: { type: Number, min: 0 },
    allowLateCheckIn: { type: Boolean, default: true },
    lateCheckInMinutes: { type: Number, min: 0 },
    autoCheckOut: { type: Boolean, default: false },
    autoCheckOutMinutes: { type: Number, min: 1 },

    // Validation Rules
    requireParentApproval: { type: Boolean, default: false },
    requireStaffVerification: { type: Boolean, default: false },
    requirePhoto: { type: Boolean, default: false },
    requireLocation: { type: Boolean, default: false },
    requireHealthScreening: { type: Boolean, default: false },

    // Notification Rules
    notifyOnCheckIn: { type: Boolean, default: false },
    notifyOnCheckOut: { type: Boolean, default: false },
    notifyOnLate: { type: Boolean, default: false },
    notifyOnNoShow: { type: Boolean, default: false },
    notificationRecipients: [String],

    // Safety Rules
    requireAuthorizedPickup: { type: Boolean, default: false },
    requireIdVerification: { type: Boolean, default: false },
    maxSessionDuration: { type: Number, min: 1 },

    // Status
    isActive: { type: Boolean, default: true, index: true },
    priority: { type: Number, default: 0, index: true },

    // Business Context
    // @ts-ignore - Mongoose type issue
    businessUnitId: { type: String, ref: 'BusinessUnit', required: true, index: true },

    // Audit
    createdBy: { type: String, ref: 'User', required: true },
    updatedBy: { type: String, ref: 'User', required: true }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Indexes for performance
attendanceRecordSchema.index({ personId: 1, checkInTime: -1 });
attendanceRecordSchema.index({ locationId: 1, checkInTime: -1 });
attendanceRecordSchema.index({ sessionId: 1, status: 1 });
attendanceRecordSchema.index({ businessUnitId: 1, attendanceType: 1, checkInTime: -1 });
attendanceRecordSchema.index({ syncStatus: 1, offlineRecordedAt: 1 });
attendanceRecordSchema.index({ isLate: 1, checkInTime: -1 });

attendanceSessionSchema.index({ locationId: 1, scheduledStartTime: -1 });
attendanceSessionSchema.index({ sessionType: 1, status: 1 });
attendanceSessionSchema.index({ instructorId: 1, scheduledStartTime: -1 });

attendanceDeviceSchema.index({ locationId: 1, isActive: 1 });
attendanceDeviceSchema.index({ isOnline: 1, lastHeartbeat: -1 });

attendanceRuleSchema.index({ locationIds: 1, isActive: 1 });
attendanceRuleSchema.index({ applicableTypes: 1, priority: -1 });

// Text search indexes
attendanceRecordSchema.index({
    personName: 'text',
    sessionName: 'text',
    className: 'text'
});

attendanceSessionSchema.index({
    sessionName: 'text',
    instructorName: 'text'
});

attendanceDeviceSchema.index({
    deviceName: 'text'
});

attendanceRuleSchema.index({
    ruleName: 'text',
    description: 'text'
});

// Pre-save middleware
attendanceRecordSchema.pre('save', function (next) {
    if (this.isNew && !this.attendanceId) {
        this.attendanceId = `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Calculate actual duration if check out time is provided
    if (this.checkOutTime && this.checkInTime) {
        this.actualDuration = Math.round((this.checkOutTime.getTime() - this.checkInTime.getTime()) / (1000 * 60));
    }

    next();
});

attendanceSessionSchema.pre('save', function (next) {
    if (this.isNew && !this.sessionId) {
        this.sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Update current attendance count
    this.currentAttendance = this.actualAttendees.length;

    next();
});

attendanceDeviceSchema.pre('save', function (next) {
    if (this.isNew && !this.deviceId) {
        this.deviceId = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

attendanceRuleSchema.pre('save', function (next) {
    if (this.isNew && !this.ruleId) {
        this.ruleId = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

// Virtual fields
attendanceRecordSchema.virtual('duration').get(function () {
    if (this.checkOutTime && this.checkInTime) {
        return this.checkOutTime.getTime() - this.checkInTime.getTime();
    }
    return 0;
});

attendanceRecordSchema.virtual('isCheckedOut').get(function () {
    return !!this.checkOutTime;
});

attendanceSessionSchema.virtual('attendanceRate').get(function () {
    if (this.expectedAttendees.length === 0) return 0;
    return (this.actualAttendees.length / this.expectedAttendees.length) * 100;
});

attendanceSessionSchema.virtual('sessionDuration').get(function () {
    if (this.actualEndTime && this.actualStartTime) {
        return this.actualEndTime.getTime() - this.actualStartTime.getTime();
    }
    if (this.scheduledEndTime && this.scheduledStartTime) {
        return this.scheduledEndTime.getTime() - this.scheduledStartTime.getTime();
    }
    return 0;
});

attendanceDeviceSchema.virtual('utilizationRate').get(function () {
    const totalOperations = this.statistics.totalCheckIns + this.statistics.totalCheckOuts;
    if (totalOperations === 0) return 0;
    return (totalOperations / (this.statistics.uptime || 1)) * 100;
});

// Export models
export const AttendanceRecord = model<IAttendanceRecord>('AttendanceRecord', attendanceRecordSchema);
export const AttendanceSession = model<IAttendanceSession>('AttendanceSession', attendanceSessionSchema);
export const AttendanceDevice = model<IAttendanceDevice>('AttendanceDevice', attendanceDeviceSchema);
export const AttendanceRule = model<IAttendanceRule>('AttendanceRule', attendanceRuleSchema);
