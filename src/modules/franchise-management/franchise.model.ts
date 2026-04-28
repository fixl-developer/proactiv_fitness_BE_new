// Franchise Management Data Models

export interface IFranchiseProfile {
    franchiseId: string;
    franchiseName?: string;
    franchiseCode?: string;
    ownerName: string;
    ownerEmail?: string;
    ownerPhone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    status: 'active' | 'inactive' | 'pending' | 'suspended' | 'approved' | 'rejected';
    createdAt: Date;
    updatedAt: Date;

    // Extended / optional fields used by the service layer
    businessName?: string;
    location?: any;
    contactEmail?: string;
    contactPhone?: string;
    investmentAmount?: number;
    joinDate?: Date;
    expiryDate?: Date;
    licenseNumber?: string;
    certifications?: string[];
    staffCount?: number;
    monthlyRevenue?: number;
}

export interface IRoyaltyCalculation {
    royaltyId: string;
    franchiseId: string;
    period?: 'monthly' | 'quarterly' | 'annual';
    startDate?: Date;
    endDate?: Date;
    totalRevenue?: number;
    royaltyPercentage: number;
    royaltyAmount: number;
    paymentStatus?: 'pending' | 'processed' | 'paid';
    paymentDate?: Date;
    createdAt: Date;

    // Extended / optional fields used by the service layer
    month?: number;
    year?: number;
    grossRevenue?: number;
    deductions?: number;
    netPayable?: number;
    status?: string;
    dueDate?: Date;
    paidDate?: Date | null;
}

export interface IFranchiseDashboard {
    dashboardId?: string;
    franchiseId: string;
    totalStudents?: number;
    activePrograms?: number;
    monthlyRevenue?: number;
    totalRevenue?: number;
    royaltyDue?: number;
    staffCount?: number;
    centerCount?: number;
    lastUpdated: Date;
    createdAt?: Date;

    // Extended / optional fields used by the service layer
    totalMembers?: number;
    activeMembers?: number;
    totalRoyaltiesPaid?: number;
    pendingRoyalties?: number;
    performanceScore?: number;
    complianceStatus?: string;
    equipmentCount?: number;
    classesOffered?: number;
    customerSatisfaction?: number;
}

export interface IFranchisePerformance {
    performanceId: string;
    franchiseId: string;
    period?: 'monthly' | 'quarterly' | 'annual';
    date?: Date;
    studentGrowth?: number;
    revenueGrowth?: number;
    profitMargin?: number;
    customerSatisfaction?: number;
    staffRetention?: number;
    createdAt: Date;

    // Extended / optional fields used by the service layer
    month?: number;
    year?: number;
    memberAcquisition?: number;
    memberRetention?: number;
    staffProductivity?: number;
    equipmentUtilization?: number;
    classAttendance?: number;
    performanceScore?: number;
    benchmarkComparison?: any;
}

export interface IFranchiseCompliance {
    complianceId: string;
    franchiseId: string;
    checkType: 'financial' | 'operational' | 'quality' | 'safety' | 'audit';
    checkDate?: Date;
    status: string;
    findings: any;
    actionItems?: string[];
    dueDate?: Date;
    createdAt: Date;

    // Extended / optional fields used by the service layer
    correctionDeadline?: Date;
    checkedBy?: string;
    checkedDate?: Date;
}

export interface IFranchiseTraining {
    trainingId: string;
    franchiseId: string;
    trainingType: 'onboarding' | 'certification' | 'update' | 'compliance';
    trainingName?: string;
    startDate: Date;
    endDate: Date;
    participants: string[];
    status: 'scheduled' | 'ongoing' | 'completed';
    createdAt: Date;

    // Extended / optional fields used by the service layer
    title?: string;
    description?: string;
    trainer?: string;
    completionRate?: number;
}

export interface IFranchiseSupport {
    supportId?: string;
    franchiseId: string;
    issueType?: 'technical' | 'operational' | 'financial' | 'marketing' | 'other';
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    assignedTo?: string;
    resolvedDate?: Date;
    createdAt: Date;

    // Extended / optional fields used by the service layer
    ticketId?: string;
    category?: string;
    updatedAt?: Date;
    resolvedAt?: Date | null;
}

export interface IFranchiseAgreement {
    agreementId: string;
    franchiseId: string;
    agreementType: 'master' | 'amendment' | 'renewal' | 'franchise';
    startDate: Date;
    endDate: Date;
    terms: any;
    royaltyRate?: number;
    status: 'active' | 'expired' | 'terminated';
    createdAt: Date;

    // Extended / optional fields used by the service layer
    signedDate?: Date;
    signedBy?: string;
}

export interface ISearchProgram {
    programId: string;
    centerId: string;
    programName: string;
    programType: 'regular' | 'camp' | 'event' | 'private' | 'assessment';
    ageGroup: string;
    skillLevel: string;
    description: string;
    pricing: number;
    capacity: number;
    currentEnrollment: number;
    startDate: Date;
    endDate: Date;
    location: string;
    tags: string[];
    rating: number;
    reviews: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ISearchFilter {
    filterId: string;
    filterType: 'location' | 'ageGroup' | 'skillLevel' | 'price' | 'rating' | 'type';
    filterValue: string;
    createdAt: Date;
}

export interface ISearchResult {
    resultId: string;
    userId: string;
    searchQuery: string;
    filters: ISearchFilter[];
    results: ISearchProgram[];
    totalResults: number;
    searchDate: Date;
    createdAt: Date;
}
