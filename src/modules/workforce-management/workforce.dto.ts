// Workforce Management DTOs

// Request DTOs
export class CreateStaffProfileDTO {
    name: string;
    email: string;
    phone: string;
    position: 'coach' | 'manager' | 'admin' | 'trainer';
    department: string;
    joinDate?: Date;
}

export class UpdateStaffProfileDTO {
    name?: string;
    email?: string;
    phone?: string;
    position?: string;
    department?: string;
    status?: 'active' | 'inactive' | 'on_leave';
}

export class AddCertificationDTO {
    certificationName: string;
    issueDate: Date;
    expiryDate: Date;
    documentUrl: string;
}

export class RequestLeaveDTO {
    leaveType: 'sick' | 'vacation' | 'personal' | 'unpaid' | 'maternity' | 'paternity';
    startDate: Date;
    endDate: Date;
    reason: string;
}

export class ApproveLeaveDTO {
    approvedBy: string;
}

export class RejectLeaveDTO {
    reason: string;
}

export class LogTimeTrackingDTO {
    date: Date;
    scheduledHours: number;
    actualHours: number;
    checkInTime: Date;
    checkOutTime: Date;
    breakTime: number;
    status: 'present' | 'absent' | 'late' | 'half_day';
    notes?: string;
}

export class CreateTimesheetDTO {
    period: 'weekly' | 'monthly';
    startDate: Date;
    endDate: Date;
}

export class CreatePerformanceKPIDTO {
    period: 'weekly' | 'monthly' | 'quarterly' | 'annual';
    startDate: Date;
    endDate: Date;
    utilization: number;
    attendanceQuality: number;
    parentFeedback: number;
    skillsScore: number;
    comments?: string;
}

export class CreatePayrollDTO {
    period: 'weekly' | 'monthly';
    startDate: Date;
    endDate: Date;
    baseSalary: number;
    overtimePay: number;
    bonuses: number;
    deductions: number;
    paymentMethod: 'bank_transfer' | 'check' | 'cash';
    bankDetails?: BankDetailsDTO;
}

export class BankDetailsDTO {
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    routingNumber: string;
    accountType: 'checking' | 'savings';
}

export class ExportPayrollDTO {
    period: 'weekly' | 'monthly';
    startDate: Date;
    endDate: Date;
    format: 'csv' | 'xero' | 'quickbooks';
}

export class AddTrainingRecordDTO {
    trainingName: string;
    trainingType: 'required' | 'recommended' | 'optional';
    status?: 'not_started' | 'in_progress' | 'completed' | 'failed';
    notes?: string;
}

export class CreateDevelopmentPlanDTO {
    year: number;
    goals?: DevelopmentGoalDTO[];
    trainingsRequired?: string[];
    trainingsRecommended?: string[];
    mentorAssigned?: string;
    reviewDate?: Date;
}

export class DevelopmentGoalDTO {
    title: string;
    description: string;
    targetDate: Date;
    status?: 'not_started' | 'in_progress' | 'completed';
    progress?: number;
}

export class AssignLocationDTO {
    locationId: string;
    locationName: string;
    role: string;
    startDate: Date;
    endDate?: Date;
    isPrimary: boolean;
    hoursPerWeek: number;
}

export class SendNotificationDTO {
    type: 'certification_expiry' | 'leave_approved' | 'leave_rejected' | 'training_assigned' | 'performance_review' | 'payroll_processed';
    title: string;
    message: string;
}

// Response DTOs
export class StaffProfileResponseDTO {
    staffId: string;
    name: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    joinDate: Date;
    backgroundCheckStatus: string;
    certifications: string[];
    locations: string[];
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export class CertificationResponseDTO {
    certificationId: string;
    staffId: string;
    certificationName: string;
    issueDate: Date;
    expiryDate: Date;
    documentUrl: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export class LeaveRequestResponseDTO {
    leaveRequestId: string;
    staffId: string;
    leaveType: string;
    startDate: Date;
    endDate: Date;
    reason: string;
    status: string;
    approvedBy?: string;
    approvedDate?: Date;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class LeaveBalanceResponseDTO {
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

export class TimeTrackingResponseDTO {
    trackingId: string;
    staffId: string;
    date: Date;
    scheduledHours: number;
    actualHours: number;
    checkInTime: Date;
    checkOutTime: Date;
    breakTime: number;
    overtimeHours: number;
    status: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class TimesheetResponseDTO {
    timesheetId: string;
    staffId: string;
    period: string;
    startDate: Date;
    endDate: Date;
    totalHours: number;
    totalOvertimeHours: number;
    totalBreakTime: number;
    status: string;
    approvedBy?: string;
    approvedDate?: Date;
    records: TimeTrackingResponseDTO[];
    createdAt: Date;
    updatedAt: Date;
}

export class PerformanceKPIResponseDTO {
    kpiId: string;
    staffId: string;
    period: string;
    startDate: Date;
    endDate: Date;
    utilization: number;
    attendanceQuality: number;
    parentFeedback: number;
    skillsScore: number;
    overallScore: number;
    comments?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class PayrollResponseDTO {
    payrollId: string;
    staffId: string;
    period: string;
    startDate: Date;
    endDate: Date;
    baseSalary: number;
    overtimePay: number;
    bonuses: number;
    deductions: number;
    netSalary: number;
    status: string;
    paymentDate?: Date;
    paymentMethod: string;
    createdAt: Date;
    updatedAt: Date;
}

export class PayrollExportResponseDTO {
    exportId: string;
    period: string;
    startDate: Date;
    endDate: Date;
    totalRecords: number;
    totalAmount: number;
    exportFormat: string;
    exportedTo: string;
    status: string;
    exportedAt?: Date;
    errorMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class TrainingRecordResponseDTO {
    trainingId: string;
    staffId: string;
    trainingName: string;
    trainingType: string;
    status: string;
    startDate?: Date;
    completionDate?: Date;
    certificateUrl?: string;
    score?: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class DevelopmentPlanResponseDTO {
    planId: string;
    staffId: string;
    year: number;
    goals: DevelopmentGoalDTO[];
    trainingsRequired: string[];
    trainingsRecommended: string[];
    mentorAssigned?: string;
    reviewDate: Date;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export class LocationAssignmentResponseDTO {
    assignmentId: string;
    staffId: string;
    locationId: string;
    locationName: string;
    role: string;
    startDate: Date;
    endDate?: Date;
    isPrimary: boolean;
    hoursPerWeek: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export class StaffNotificationResponseDTO {
    notificationId: string;
    staffId: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    readAt?: Date;
    createdAt: Date;
}
