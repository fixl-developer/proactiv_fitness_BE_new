import { Schema, model } from 'mongoose';
import {
    IStaff,
    IStaffSchedule,
    IStaffAttendance,
    StaffType,
    StaffStatus,
    CertificationStatus,
    BackgroundCheckStatus,
    AvailabilityStatus,
    LeaveType,
    LeaveStatus,
    ShiftType
} from './staff.interface';
import { baseSchemaOptions } from '../../shared/base/base.model';

// Personal Info Schema
const personalInfoSchema = new Schema({
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    middleName: { type: String, trim: true, maxlength: 50 },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    nationality: { type: String, required: true, trim: true },
    idNumber: { type: String, required: true, trim: true },
    idType: { type: String, enum: ['passport', 'national_id', 'driving_license'], required: true },
    profilePhoto: { type: String, trim: true }
});

// Contact Info Schema
const contactInfoSchema = new Schema({
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    alternatePhone: { type: String, trim: true },
    address: {
        street: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true },
        postalCode: { type: String, required: true, trim: true }
    },
    emergencyContact: {
        name: { type: String, required: true, trim: true },
        relationship: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        email: { type: String, trim: true, lowercase: true }
    }
});

// Certification Schema
const certificationSchema = new Schema({
    certificationId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    issuingOrganization: { type: String, required: true, trim: true },
    issueDate: { type: Date, required: true },
    expiryDate: Date,
    certificateNumber: { type: String, required: true, trim: true },
    status: { type: String, enum: Object.values(CertificationStatus), default: CertificationStatus.VALID },
    documentUrl: { type: String, trim: true },
    verificationStatus: { type: String, enum: ['verified', 'pending', 'failed'], default: 'pending' },
    notes: { type: String, trim: true }
});

// Background Check Schema
const backgroundCheckSchema = new Schema({
    checkId: { type: String, required: true, unique: true },
    type: { type: String, enum: ['criminal', 'employment', 'education', 'reference', 'medical'], required: true },
    provider: { type: String, required: true, trim: true },
    requestDate: { type: Date, required: true },
    completionDate: Date,
    status: { type: String, enum: Object.values(BackgroundCheckStatus), default: BackgroundCheckStatus.PENDING },
    result: { type: String, enum: ['clear', 'flagged', 'failed'] },
    documentUrl: { type: String, trim: true },
    notes: { type: String, trim: true },
    expiryDate: Date
});

// Availability Slot Schema
const availabilitySlotSchema = new Schema({
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    startTime: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    endTime: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    isAvailable: { type: Boolean, default: true },
    notes: { type: String, trim: true }
});

// Time Off Request Schema
const timeOffRequestSchema = new Schema({
    requestId: { type: String, required: true, unique: true },
    type: { type: String, enum: Object.values(LeaveType), required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalDays: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: Object.values(LeaveStatus), default: LeaveStatus.PENDING },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    rejectionReason: { type: String, trim: true },
    documents: [String],
    isEmergency: { type: Boolean, default: false }
});

// Performance Metrics Schema
const performanceMetricsSchema = new Schema({
    period: { type: String, required: true, match: /^\d{4}-\d{2}$/ },
    classesAssigned: { type: Number, default: 0, min: 0 },
    classesCompleted: { type: Number, default: 0, min: 0 },
    attendanceRate: { type: Number, default: 0, min: 0, max: 100 },
    punctualityScore: { type: Number, default: 0, min: 0, max: 100 },
    studentSatisfactionRating: { type: Number, default: 0, min: 0, max: 5 },
    parentFeedbackRating: { type: Number, default: 0, min: 0, max: 5 },
    skillAssessmentScore: { type: Number, default: 0, min: 0, max: 100 },
    improvementAreas: [String],
    achievements: [String],
    goals: [String]
});

// Training Record Schema
const trainingRecordSchema = new Schema({
    trainingId: { type: String, required: true },
    trainingName: { type: String, required: true, trim: true },
    completionDate: { type: Date, required: true },
    certificateUrl: { type: String, trim: true },
    score: { type: Number, min: 0, max: 100 }
});

// Payroll Info Schema
const payrollInfoSchema = new Schema({
    employeeId: { type: String, required: true, trim: true },
    payrollProvider: { type: String, trim: true },
    hourlyRate: { type: Number, min: 0 },
    monthlyRate: { type: Number, min: 0 },
    currency: { type: String, required: true, default: 'USD' },
    paymentMethod: { type: String, enum: ['bank_transfer', 'cash', 'check', 'digital_wallet'], required: true },
    bankDetails: {
        bankName: { type: String, trim: true },
        accountNumber: { type: String, trim: true },
        routingNumber: { type: String, trim: true },
        swiftCode: { type: String, trim: true }
    },
    taxId: { type: String, trim: true },
    socialSecurityNumber: { type: String, trim: true }
});

// Staff Schema
const staffSchema = new Schema<IStaff>({
    // Basic Information
    staffId: { type: String, required: true, unique: true, index: true },
    personalInfo: { type: personalInfoSchema, required: true },
    contactInfo: { type: contactInfoSchema, required: true },

    // Employment Details
    staffType: { type: String, enum: Object.values(StaffType), required: true, index: true },
    status: { type: String, enum: Object.values(StaffStatus), default: StaffStatus.ACTIVE, index: true },
    hireDate: { type: Date, required: true, index: true },
    terminationDate: Date,
    probationEndDate: Date,

    // Work Assignment
    businessUnitId: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, index: true },
    locationIds: [{ type: Schema.Types.ObjectId, ref: 'Location', required: true }],
    primaryLocationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    supervisorId: { type: Schema.Types.ObjectId, ref: 'Staff' },

    // Certifications & Background
    certifications: [certificationSchema],
    backgroundChecks: [backgroundCheckSchema],

    // Skills & Specializations
    skills: [{ type: String, trim: true }],
    specializations: [{ type: String, trim: true }],
    languages: [{ type: String, trim: true }],
    experienceYears: { type: Number, default: 0, min: 0 },

    // Availability & Scheduling
    weeklyAvailability: [availabilitySlotSchema],
    currentAvailabilityStatus: { type: String, enum: Object.values(AvailabilityStatus), default: AvailabilityStatus.AVAILABLE, index: true },
    maxHoursPerWeek: { type: Number, default: 40, min: 0, max: 168 },
    preferredShiftTypes: [{ type: String, enum: Object.values(ShiftType) }],

    // Leave Management
    annualLeaveEntitlement: { type: Number, default: 21, min: 0 },
    annualLeaveUsed: { type: Number, default: 0, min: 0 },
    sickLeaveEntitlement: { type: Number, default: 10, min: 0 },
    sickLeaveUsed: { type: Number, default: 0, min: 0 },
    timeOffRequests: [timeOffRequestSchema],

    // Performance & Development
    performanceMetrics: [performanceMetricsSchema],
    trainingRecords: [trainingRecordSchema],

    // Payroll & Benefits
    payrollInfo: { type: payrollInfoSchema, required: true },
    benefits: [String],

    // System Fields
    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: Date,
    notes: { type: String, trim: true },

    // Audit
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Staff Schedule Schema
const staffScheduleSchema = new Schema<IStaffSchedule>({
    scheduleId: { type: String, required: true, unique: true, index: true },
    staffId: { type: String, required: true, index: true },
    locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true, index: true },

    // Schedule Details
    date: { type: Date, required: true, index: true },
    shiftType: { type: String, enum: Object.values(ShiftType), required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    breakStartTime: Date,
    breakEndTime: Date,

    // Assignment Details
    assignedClasses: [{
        classId: { type: String, required: true },
        className: { type: String, required: true, trim: true },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        roomId: { type: String, required: true },
        studentCount: { type: Number, default: 0, min: 0 }
    }],

    // Status
    status: { type: String, enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'], default: 'scheduled', index: true },
    actualStartTime: Date,
    actualEndTime: Date,

    // Tracking
    checkInTime: Date,
    checkOutTime: Date,
    totalHours: { type: Number, min: 0 },
    overtimeHours: { type: Number, default: 0, min: 0 },

    // Notes
    notes: { type: String, trim: true },
    managerNotes: { type: String, trim: true },

    // Audit
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Staff Attendance Schema
const staffAttendanceSchema = new Schema<IStaffAttendance>({
    attendanceId: { type: String, required: true, unique: true, index: true },
    staffId: { type: String, required: true, index: true },
    scheduleId: { type: String, index: true },
    locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true, index: true },

    // Attendance Details
    date: { type: Date, required: true, index: true },
    checkInTime: { type: Date, required: true },
    checkOutTime: Date,
    totalHours: { type: Number, min: 0 },

    // Break Times
    breakRecords: [{
        breakStart: { type: Date, required: true },
        breakEnd: Date,
        breakType: { type: String, enum: ['lunch', 'short', 'emergency'], required: true },
        duration: { type: Number, min: 0 }
    }],

    // Status
    status: { type: String, enum: ['present', 'absent', 'late', 'early_departure', 'overtime'], default: 'present', index: true },
    isLate: { type: Boolean, default: false, index: true },
    lateMinutes: { type: Number, min: 0 },
    isEarlyDeparture: { type: Boolean, default: false },
    earlyDepartureMinutes: { type: Number, min: 0 },

    // Location Tracking
    checkInLocation: {
        latitude: { type: Number, min: -90, max: 90 },
        longitude: { type: Number, min: -180, max: 180 },
        address: { type: String, trim: true }
    },
    checkOutLocation: {
        latitude: { type: Number, min: -90, max: 90 },
        longitude: { type: Number, min: -180, max: 180 },
        address: { type: String, trim: true }
    },

    // Verification
    checkInMethod: { type: String, enum: ['manual', 'qr_code', 'nfc', 'biometric', 'mobile_app'], required: true },
    checkOutMethod: { type: String, enum: ['manual', 'qr_code', 'nfc', 'biometric', 'mobile_app'] },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },

    // Notes
    notes: { type: String, trim: true },
    managerNotes: { type: String, trim: true },

    // Audit
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Indexes for performance
staffSchema.index({ businessUnitId: 1, staffType: 1, status: 1 });
staffSchema.index({ primaryLocationId: 1, isActive: 1 });
staffSchema.index({ 'personalInfo.firstName': 1, 'personalInfo.lastName': 1 });
staffSchema.index({ 'contactInfo.email': 1 });
staffSchema.index({ skills: 1, specializations: 1 });
staffSchema.index({ currentAvailabilityStatus: 1, isActive: 1 });

staffScheduleSchema.index({ staffId: 1, date: 1 });
staffScheduleSchema.index({ locationId: 1, date: 1, status: 1 });
staffScheduleSchema.index({ date: 1, shiftType: 1 });

staffAttendanceSchema.index({ staffId: 1, date: 1 });
staffAttendanceSchema.index({ locationId: 1, date: 1 });
staffAttendanceSchema.index({ date: 1, status: 1 });
staffAttendanceSchema.index({ isLate: 1, date: 1 });

// Text search indexes
staffSchema.index({
    'personalInfo.firstName': 'text',
    'personalInfo.lastName': 'text',
    'contactInfo.email': 'text',
    skills: 'text',
    specializations: 'text'
});

// Pre-save middleware
staffSchema.pre('save', function (next) {
    if (this.isNew && !this.staffId) {
        this.staffId = `staff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

staffScheduleSchema.pre('save', function (next) {
    if (this.isNew && !this.scheduleId) {
        this.scheduleId = `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

staffAttendanceSchema.pre('save', function (next) {
    if (this.isNew && !this.attendanceId) {
        this.attendanceId = `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Calculate total hours if check out time is provided
    if (this.checkOutTime && this.checkInTime) {
        this.totalHours = (this.checkOutTime.getTime() - this.checkInTime.getTime()) / (1000 * 60 * 60);
    }

    next();
});

// Virtual fields
staffSchema.virtual('fullName').get(function () {
    return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

staffSchema.virtual('age').get(function () {
    const today = new Date();
    const birthDate = new Date(this.personalInfo.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
});

staffSchema.virtual('remainingAnnualLeave').get(function () {
    return this.annualLeaveEntitlement - this.annualLeaveUsed;
});

staffSchema.virtual('remainingSickLeave').get(function () {
    return this.sickLeaveEntitlement - this.sickLeaveUsed;
});

staffAttendanceSchema.virtual('workDuration').get(function () {
    if (this.checkOutTime && this.checkInTime) {
        return this.checkOutTime.getTime() - this.checkInTime.getTime();
    }
    return 0;
});

// Export models
export const Staff = model<IStaff>('Staff', staffSchema);
export const StaffSchedule = model<IStaffSchedule>('StaffSchedule', staffScheduleSchema);
export const StaffAttendance = model<IStaffAttendance>('StaffAttendance', staffAttendanceSchema);