// Workforce Management Data Models

// Staff Profile Model
export interface IStaffProfile {
    staffId: string;
    name: string;
    email: string;
    phone: string;
    position: 'coach' | 'manager' | 'admin' | 'trainer';
    department: string;
    joinDate: Date;
    backgroundCheckStatus: 'pending' | 'approved' | 'rejected';
    backgroundCheckDate?: Date;
    certifications: string[];
    locations: string[];
    availability: AvailabilitySchedule;
    documents: Document[];
    status: 'active' | 'inactive' | 'on_leave';
    createdAt: Date;
    updatedAt: Date;
}

export interface AvailabilitySchedule {
    monday: TimeSlot[];
    tuesday: TimeSlot[];
    wednesday: TimeSlot[];
    thursday: TimeSlot[];
    friday: TimeSlot[];
    saturday: TimeSlot[];
    sunday: TimeSlot[];
}

export interface TimeSlot {
    startTime: string;
    endTime: string;
    available: boolean;
}

export interface Document {
    documentId: string;
    type: 'certification' | 'background_check' | 'contract' | 'other';
    url: string;
    uploadedAt: Date;
    expiresAt?: Date;
}

// Certification Model
export interface ICertification {
    certificationId: string;
    staffId: string;
    certificationName: string;
    issueDate: Date;
    expiryDate: Date;
    documentUrl: string;
    status: 'active' | 'expiring' | 'expired';
    notificationSent: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Leave Request Model
export interface ILeaveRequest {
    leaveRequestId: string;
    staffId: string;
    leaveType: 'sick' | 'vacation' | 'personal' | 'unpaid' | 'maternity' | 'paternity';
    startDate: Date;
    endDate: Date;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    approvedBy?: string;
    approvedDate?: Date;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Leave Balance Model
export interface ILeaveBalance {
    balanceId: string;
    staffId: string;
    year: number;
    sickLeave: number;
    vacationLeave: number;
    personalLeave: number;
    unpaidLeave: number;
    maternityLeave: number;
    paternityLeave: number;
    usedSickLeave: number;
    usedVacationLeave: number;
    usedPersonalLeave: number;
    usedUnpaidLeave: number;
    usedMaternityLeave: number;
    usedPaternityLeave: number;
    createdAt: Date;
    updatedAt: Date;
}

// Time Tracking Model
export interface ITimeTracking {
    trackingId: string;
    staffId: string;
    date: Date;
    scheduledHours: number;
    actualHours: number;
    checkInTime: Date;
    checkOutTime: Date;
    breakTime: number;
    overtimeHours: number;
    status: 'present' | 'absent' | 'late' | 'half_day';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Timesheet Model
export interface ITimesheet {
    timesheetId: string;
    staffId: string;
    period: 'weekly' | 'monthly';
    startDate: Date;
    endDate: Date;
    totalHours: number;
    totalOvertimeHours: number;
    totalBreakTime: number;
    status: 'draft' | 'submitted' | 'approved' | 'rejected';
    approvedBy?: string;
    approvedDate?: Date;
    records: ITimeTracking[];
    createdAt: Date;
    updatedAt: Date;
}

// Performance KPI Model
export interface IPerformanceKPI {
    kpiId: string;
    staffId: string;
    period: 'weekly' | 'monthly' | 'quarterly' | 'annual';
    startDate: Date;
    endDate: Date;
    utilization: number; // 0-100
    attendanceQuality: number; // 0-100
    parentFeedback: number; // 0-100
    skillsScore: number; // 0-100
    overallScore: number; // 0-100
    comments?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Payroll Model
export interface IPayroll {
    payrollId: string;
    staffId: string;
    period: 'weekly' | 'monthly';
    startDate: Date;
    endDate: Date;
    baseSalary: number;
    overtimePay: number;
    bonuses: number;
    deductions: number;
    netSalary: number;
    status: 'draft' | 'processed' | 'paid';
    paymentDate?: Date;
    paymentMethod: 'bank_transfer' | 'check' | 'cash';
    bankDetails?: BankDetails;
    createdAt: Date;
    updatedAt: Date;
}

export interface BankDetails {
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    routingNumber: string;
    accountType: 'checking' | 'savings';
}

// Training Record Model
export interface ITrainingRecord {
    trainingId: string;
    staffId: string;
    trainingName: string;
    trainingType: 'required' | 'recommended' | 'optional';
    status: 'not_started' | 'in_progress' | 'completed' | 'failed';
    startDate?: Date;
    completionDate?: Date;
    certificateUrl?: string;
    score?: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Development Plan Model
export interface IDevelopmentPlan {
    planId: string;
    staffId: string;
    year: number;
    goals: DevelopmentGoal[];
    trainingsRequired: string[];
    trainingsRecommended: string[];
    mentorAssigned?: string;
    reviewDate: Date;
    status: 'draft' | 'active' | 'completed' | 'archived';
    createdAt: Date;
    updatedAt: Date;
}

export interface DevelopmentGoal {
    goalId: string;
    title: string;
    description: string;
    targetDate: Date;
    status: 'not_started' | 'in_progress' | 'completed';
    progress: number; // 0-100
}

// Multi-Location Assignment Model
export interface ILocationAssignment {
    assignmentId: string;
    staffId: string;
    locationId: string;
    locationName: string;
    role: string;
    startDate: Date;
    endDate?: Date;
    isPrimary: boolean;
    hoursPerWeek: number;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

// Staff Performance Metrics Model
export interface IStaffPerformanceMetrics {
    metricsId: string;
    staffId: string;
    period: 'monthly' | 'quarterly' | 'annual';
    startDate: Date;
    endDate: Date;
    classesHeld: number;
    studentsSatisfaction: number; // 0-100
    parentFeedback: number; // 0-100
    attendanceRate: number; // 0-100
    punctualityRate: number; // 0-100
    certificationsCompleted: number;
    trainingHoursCompleted: number;
    incidentsReported: number;
    createdAt: Date;
    updatedAt: Date;
}

// Payroll Export Model
export interface IPayrollExport {
    exportId: string;
    period: 'weekly' | 'monthly';
    startDate: Date;
    endDate: Date;
    totalRecords: number;
    totalAmount: number;
    exportFormat: 'csv' | 'xero' | 'quickbooks';
    exportedTo: string; // Xero, QuickBooks, etc.
    status: 'pending' | 'processing' | 'completed' | 'failed';
    exportedAt?: Date;
    errorMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Staff Attendance Model
export interface IStaffAttendance {
    attendanceId: string;
    staffId: string;
    date: Date;
    status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';
    checkInTime?: Date;
    checkOutTime?: Date;
    reason?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Background Check Model
export interface IBackgroundCheck {
    checkId: string;
    staffId: string;
    checkType: 'criminal' | 'reference' | 'medical' | 'other';
    status: 'pending' | 'approved' | 'rejected' | 'expired';
    requestedDate: Date;
    completedDate?: Date;
    expiryDate?: Date;
    documentUrl?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Staff Notification Model
export interface IStaffNotification {
    notificationId: string;
    staffId: string;
    type: 'certification_expiry' | 'leave_approved' | 'leave_rejected' | 'training_assigned' | 'performance_review' | 'payroll_processed';
    title: string;
    message: string;
    read: boolean;
    readAt?: Date;
    createdAt: Date;
}

// Workforce Analytics Model
export interface IWorkforceAnalytics {
    analyticsId: string;
    period: 'monthly' | 'quarterly' | 'annual';
    startDate: Date;
    endDate: Date;
    totalStaff: number;
    activeStaff: number;
    inactiveStaff: number;
    onLeaveStaff: number;
    averageUtilization: number;
    averageAttendanceRate: number;
    averageSatisfactionScore: number;
    turnoverRate: number;
    certificationComplianceRate: number;
    trainingCompletionRate: number;
    createdAt: Date;
}
