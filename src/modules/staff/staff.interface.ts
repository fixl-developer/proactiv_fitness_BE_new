import { Document } from 'mongoose';

export enum StaffType {
    COACH = 'coach',
    INSTRUCTOR = 'instructor',
    MANAGER = 'manager',
    ADMIN = 'admin',
    RECEPTIONIST = 'receptionist',
    MAINTENANCE = 'maintenance',
    SECURITY = 'security',
    CLEANER = 'cleaner'
}

export enum StaffStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    ON_LEAVE = 'on_leave',
    SUSPENDED = 'suspended',
    TERMINATED = 'terminated'
}

export enum CertificationStatus {
    VALID = 'valid',
    EXPIRED = 'expired',
    EXPIRING_SOON = 'expiring_soon',
    PENDING = 'pending',
    REJECTED = 'rejected'
}

export enum BackgroundCheckStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    EXPIRED = 'expired',
    NOT_REQUIRED = 'not_required'
}

export enum AvailabilityStatus {
    AVAILABLE = 'available',
    UNAVAILABLE = 'unavailable',
    PARTIALLY_AVAILABLE = 'partially_available',
    ON_BREAK = 'on_break',
    SICK_LEAVE = 'sick_leave',
    VACATION = 'vacation'
}

export enum LeaveType {
    ANNUAL = 'annual',
    SICK = 'sick',
    MATERNITY = 'maternity',
    PATERNITY = 'paternity',
    EMERGENCY = 'emergency',
    UNPAID = 'unpaid',
    COMPASSIONATE = 'compassionate',
    STUDY = 'study'
}

export enum LeaveStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    CANCELLED = 'cancelled'
}

export enum ShiftType {
    MORNING = 'morning',
    AFTERNOON = 'afternoon',
    EVENING = 'evening',
    FULL_DAY = 'full_day',
    SPLIT = 'split',
    ON_CALL = 'on_call'
}

export interface IPersonalInfo {
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other';
    nationality: string;
    idNumber: string;
    idType: 'passport' | 'national_id' | 'driving_license';
    profilePhoto?: string;
}

export interface IContactInfo {
    email: string;
    phone: string;
    alternatePhone?: string;
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };
    emergencyContact: {
        name: string;
        relationship: string;
        phone: string;
        email?: string;
    };
}

export interface ICertification {
    certificationId: string;
    name: string;
    issuingOrganization: string;
    issueDate: Date;
    expiryDate?: Date;
    certificateNumber: string;
    status: CertificationStatus;
    documentUrl?: string;
    verificationStatus: 'verified' | 'pending' | 'failed';
    notes?: string;
}

export interface IBackgroundCheck {
    checkId: string;
    type: 'criminal' | 'employment' | 'education' | 'reference' | 'medical';
    provider: string;
    requestDate: Date;
    completionDate?: Date;
    status: BackgroundCheckStatus;
    result?: 'clear' | 'flagged' | 'failed';
    documentUrl?: string;
    notes?: string;
    expiryDate?: Date;
}

export interface IAvailabilitySlot {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
    isAvailable: boolean;
    notes?: string;
}

export interface ITimeOffRequest {
    requestId: string;
    type: LeaveType;
    startDate: Date;
    endDate: Date;
    totalDays: number;
    reason: string;
    status: LeaveStatus;
    approvedBy?: string;
    approvedAt?: Date;
    rejectionReason?: string;
    documents?: string[];
    isEmergency: boolean;
}

export interface IPerformanceMetrics {
    period: string; // YYYY-MM format
    classesAssigned: number;
    classesCompleted: number;
    attendanceRate: number;
    punctualityScore: number;
    studentSatisfactionRating: number;
    parentFeedbackRating: number;
    skillAssessmentScore: number;
    improvementAreas: string[];
    achievements: string[];
    goals: string[];
}

export interface IPayrollInfo {
    employeeId: string;
    payrollProvider?: string;
    hourlyRate?: number;
    monthlyRate?: number;
    currency: string;
    paymentMethod: 'bank_transfer' | 'cash' | 'check' | 'digital_wallet';
    bankDetails?: {
        bankName: string;
        accountNumber: string;
        routingNumber?: string;
        swiftCode?: string;
    };
    taxId?: string;
    socialSecurityNumber?: string;
}

export interface IStaff extends Document {
    // Basic Information
    staffId: string;
    personalInfo: IPersonalInfo;
    contactInfo: IContactInfo;

    // Employment Details
    staffType: StaffType;
    status: StaffStatus;
    hireDate: Date;
    terminationDate?: Date;
    probationEndDate?: Date;

    // Work Assignment
    businessUnitId: string;
    locationIds: string[];
    primaryLocationId: string;
    departmentId?: string;
    supervisorId?: string;

    // Certifications & Background
    certifications: ICertification[];
    backgroundChecks: IBackgroundCheck[];

    // Skills & Specializations
    skills: string[];
    specializations: string[];
    languages: string[];
    experienceYears: number;

    // Availability & Scheduling
    weeklyAvailability: IAvailabilitySlot[];
    currentAvailabilityStatus: AvailabilityStatus;
    maxHoursPerWeek: number;
    preferredShiftTypes: ShiftType[];

    // Leave Management
    annualLeaveEntitlement: number;
    annualLeaveUsed: number;
    sickLeaveEntitlement: number;
    sickLeaveUsed: number;
    timeOffRequests: ITimeOffRequest[];

    // Performance & Development
    performanceMetrics: IPerformanceMetrics[];
    trainingRecords: {
        trainingId: string;
        trainingName: string;
        completionDate: Date;
        certificateUrl?: string;
        score?: number;
    }[];

    // Payroll & Benefits
    payrollInfo: IPayrollInfo;
    benefits: string[];

    // System Fields
    isActive: boolean;
    lastLoginAt?: Date;
    notes?: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IStaffSchedule extends Document {
    scheduleId: string;
    staffId: string;
    locationId: string;

    // Schedule Details
    date: Date;
    shiftType: ShiftType;
    startTime: Date;
    endTime: Date;
    breakStartTime?: Date;
    breakEndTime?: Date;

    // Assignment Details
    assignedClasses: {
        classId: string;
        className: string;
        startTime: Date;
        endTime: Date;
        roomId: string;
        studentCount: number;
    }[];

    // Status
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
    actualStartTime?: Date;
    actualEndTime?: Date;

    // Tracking
    checkInTime?: Date;
    checkOutTime?: Date;
    totalHours?: number;
    overtimeHours?: number;

    // Notes
    notes?: string;
    managerNotes?: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IStaffAttendance extends Document {
    attendanceId: string;
    staffId: string;
    scheduleId?: string;
    locationId: string;

    // Attendance Details
    date: Date;
    checkInTime: Date;
    checkOutTime?: Date;
    totalHours?: number;

    // Break Times
    breakRecords: {
        breakStart: Date;
        breakEnd?: Date;
        breakType: 'lunch' | 'short' | 'emergency';
        duration?: number;
    }[];

    // Status
    status: 'present' | 'absent' | 'late' | 'early_departure' | 'overtime';
    isLate: boolean;
    lateMinutes?: number;
    isEarlyDeparture: boolean;
    earlyDepartureMinutes?: number;

    // Location Tracking
    checkInLocation?: {
        latitude: number;
        longitude: number;
        address?: string;
    };
    checkOutLocation?: {
        latitude: number;
        longitude: number;
        address?: string;
    };

    // Verification
    checkInMethod: 'manual' | 'qr_code' | 'nfc' | 'biometric' | 'mobile_app';
    checkOutMethod?: 'manual' | 'qr_code' | 'nfc' | 'biometric' | 'mobile_app';
    verifiedBy?: string;

    // Notes
    notes?: string;
    managerNotes?: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Request/Response Interfaces
export interface ICreateStaffRequest {
    personalInfo: IPersonalInfo;
    contactInfo: IContactInfo;
    staffType: StaffType;
    businessUnitId: string;
    locationIds: string[];
    primaryLocationId: string;
    skills?: string[];
    specializations?: string[];
    languages?: string[];
    experienceYears?: number;
    maxHoursPerWeek?: number;
    payrollInfo: IPayrollInfo;
}

export interface IUpdateStaffRequest {
    personalInfo?: Partial<IPersonalInfo>;
    contactInfo?: Partial<IContactInfo>;
    staffType?: StaffType;
    status?: StaffStatus;
    locationIds?: string[];
    primaryLocationId?: string;
    skills?: string[];
    specializations?: string[];
    maxHoursPerWeek?: number;
}

export interface IStaffFilter {
    staffType?: StaffType;
    status?: StaffStatus;
    businessUnitId?: string;
    locationId?: string;
    skills?: string[];
    availabilityStatus?: AvailabilityStatus;
    searchText?: string;
}

export interface IScheduleStaffRequest {
    staffId: string;
    locationId: string;
    date: Date;
    shiftType: ShiftType;
    startTime: Date;
    endTime: Date;
    assignedClasses?: string[];
}

export interface IStaffAvailabilityRequest {
    staffId: string;
    weeklyAvailability: IAvailabilitySlot[];
    availabilityStatus: AvailabilityStatus;
}

export interface ITimeOffRequestData {
    staffId: string;
    type: LeaveType;
    startDate: Date;
    endDate: Date;
    reason: string;
    isEmergency?: boolean;
    documents?: string[];
}

export interface IStaffStatistics {
    totalStaff: number;
    activeStaff: number;
    staffByType: Record<StaffType, number>;
    staffByStatus: Record<StaffStatus, number>;
    staffByLocation: {
        locationId: string;
        locationName: string;
        staffCount: number;
    }[];
    averageExperience: number;
    certificationExpiring: number;
    backgroundChecksExpiring: number;
    attendanceRate: number;
    turnoverRate: number;
}

export interface IAttendanceStatistics {
    totalAttendanceRecords: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    overtimeHours: number;
    averageHoursPerDay: number;
    attendanceRate: number;
    punctualityRate: number;
    attendanceByLocation: {
        locationId: string;
        locationName: string;
        attendanceRate: number;
    }[];
}