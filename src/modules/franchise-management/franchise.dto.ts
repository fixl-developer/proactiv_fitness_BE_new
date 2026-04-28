// Request DTOs
export interface CreateFranchiseRequest {
    ownerName: string;
    businessName: string;
    location: string;
    contactEmail: string;
    contactPhone: string;
    investmentAmount: number;
    licenseNumber?: string;
    certifications?: string[];
    staffCount?: number;
}

export interface UpdateFranchiseRequest {
    ownerName?: string;
    businessName?: string;
    location?: string;
    contactEmail?: string;
    contactPhone?: string;
    investmentAmount?: number;
    status?: string;
    licenseNumber?: string;
    certifications?: string[];
    staffCount?: number;
    monthlyRevenue?: number;
}

export interface CalculateRoyaltyRequest {
    monthlyRevenue: number;
}

export interface TrackPerformanceRequest {
    memberAcquisition: number;
    memberRetention: number;
    revenueGrowth: number;
    customerSatisfaction: number;
    staffProductivity: number;
    equipmentUtilization: number;
    classAttendance: number;
}

export interface AddComplianceCheckRequest {
    checkType: string;
    findings?: string[];
    checkedBy?: string;
}

export interface CreateTrainingRequest {
    trainingType: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    trainer: string;
    participants?: string[];
}

export interface CreateSupportTicketRequest {
    category: string;
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    assignedTo?: string;
}

export interface UpdateSupportTicketRequest {
    status?: string;
    priority?: string;
    assignedTo?: string;
    description?: string;
}

export interface CreateAgreementRequest {
    agreementType: string;
    startDate: Date;
    endDate: Date;
    terms: string[];
    signedBy: string;
}

export interface RejectFranchiseRequest {
    reason: string;
}

export interface UpdateComplianceStatusRequest {
    status: string;
}

// Response DTOs
export interface FranchiseResponse {
    franchiseId: string;
    ownerName: string;
    businessName: string;
    location: string;
    contactEmail: string;
    contactPhone: string;
    investmentAmount: number;
    status: string;
    joinDate: Date;
    expiryDate: Date;
    licenseNumber: string;
    certifications: string[];
    staffCount: number;
    monthlyRevenue: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface RoyaltyResponse {
    royaltyId: string;
    franchiseId: string;
    month: number;
    year: number;
    grossRevenue: number;
    royaltyPercentage: number;
    royaltyAmount: number;
    deductions: number;
    netPayable: number;
    status: string;
    dueDate: Date;
    paidDate: Date | null;
    createdAt: Date;
}

export interface DashboardResponse {
    franchiseId: string;
    totalMembers: number;
    activeMembers: number;
    monthlyRevenue: number;
    totalRoyaltiesPaid: number;
    pendingRoyalties: number;
    performanceScore: number;
    complianceStatus: string;
    staffCount: number;
    equipmentCount: number;
    classesOffered: number;
    customerSatisfaction: number;
    lastUpdated: Date;
}

export interface PerformanceResponse {
    performanceId: string;
    franchiseId: string;
    month: number;
    year: number;
    memberAcquisition: number;
    memberRetention: number;
    revenueGrowth: number;
    customerSatisfaction: number;
    staffProductivity: number;
    equipmentUtilization: number;
    classAttendance: number;
    performanceScore: number;
    benchmarkComparison: Record<string, any>;
    createdAt: Date;
}

export interface ComplianceResponse {
    complianceId: string;
    franchiseId: string;
    checkType: string;
    status: string;
    findings: string[];
    correctionDeadline: Date;
    checkedBy: string;
    checkedDate: Date;
    createdAt: Date;
}

export interface TrainingResponse {
    trainingId: string;
    franchiseId: string;
    trainingType: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    trainer: string;
    participants: string[];
    status: string;
    completionRate: number;
    createdAt: Date;
}

export interface SupportTicketResponse {
    ticketId: string;
    franchiseId: string;
    category: string;
    subject: string;
    description: string;
    priority: string;
    status: string;
    assignedTo: string;
    createdAt: Date;
    updatedAt: Date;
    resolvedAt: Date | null;
}

export interface AgreementResponse {
    agreementId: string;
    franchiseId: string;
    agreementType: string;
    startDate: Date;
    endDate: Date;
    terms: string[];
    status: string;
    signedDate: Date;
    signedBy: string;
    createdAt: Date;
}

export interface FranchiseStatsResponse {
    totalFranchises: number;
    approvedFranchises: number;
    pendingFranchises: number;
    rejectedFranchises: number;
    totalInvestment: number;
    totalRevenue: number;
    totalStaff: number;
}

export interface RoyaltyReportResponse {
    franchiseId: string;
    year: number;
    totalRoyalties: number;
    totalPaid: number;
    pending: number;
    monthlyBreakdown: RoyaltyResponse[];
}

export interface PerformanceHistoryResponse {
    franchiseId: string;
    currentPerformance: PerformanceResponse | undefined;
    trend: string;
    monthsAnalyzed: number;
}

// Generic Response Wrapper
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
