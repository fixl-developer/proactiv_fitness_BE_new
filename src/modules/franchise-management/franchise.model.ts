// Franchise Management Data Models

export interface IFranchiseProfile {
    franchiseId: string;
    franchiseName: string;
    franchiseCode: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    status: 'active' | 'inactive' | 'pending' | 'suspended';
    createdAt: Date;
    updatedAt: Date;
}

export interface IRoyaltyCalculation {
    royaltyId: string;
    franchiseId: string;
    period: 'monthly' | 'quarterly' | 'annual';
    startDate: Date;
    endDate: Date;
    totalRevenue: number;
    royaltyPercentage: number;
    royaltyAmount: number;
    paymentStatus: 'pending' | 'processed' | 'paid';
    paymentDate?: Date;
    createdAt: Date;
}

export interface IFranchiseDashboard {
    dashboardId: string;
    franchiseId: string;
    totalStudents: number;
    activePrograms: number;
    monthlyRevenue: number;
    totalRevenue: number;
    royaltyDue: number;
    staffCount: number;
    centerCount: number;
    lastUpdated: Date;
    createdAt: Date;
}

export interface IFranchisePerformance {
    performanceId: string;
    franchiseId: string;
    period: 'monthly' | 'quarterly' | 'annual';
    date: Date;
    studentGrowth: number;
    revenueGrowth: number;
    profitMargin: number;
    customerSatisfaction: number;
    staffRetention: number;
    createdAt: Date;
}

export interface IFranchiseCompliance {
    complianceId: string;
    franchiseId: string;
    checkType: 'financial' | 'operational' | 'quality' | 'safety';
    checkDate: Date;
    status: 'passed' | 'failed' | 'pending';
    findings: string;
    actionItems: string[];
    dueDate?: Date;
    createdAt: Date;
}

export interface IFranchiseTraining {
    trainingId: string;
    franchiseId: string;
    trainingType: 'onboarding' | 'certification' | 'update' | 'compliance';
    trainingName: string;
    startDate: Date;
    endDate: Date;
    participants: string[];
    status: 'scheduled' | 'ongoing' | 'completed';
    createdAt: Date;
}

export interface IFranchiseSupport {
    supportId: string;
    franchiseId: string;
    issueType: 'technical' | 'operational' | 'financial' | 'marketing' | 'other';
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    assignedTo?: string;
    resolvedDate?: Date;
    createdAt: Date;
}

export interface IFranchiseAgreement {
    agreementId: string;
    franchiseId: string;
    agreementType: 'master' | 'amendment' | 'renewal';
    startDate: Date;
    endDate: Date;
    terms: string;
    royaltyRate: number;
    status: 'active' | 'expired' | 'terminated';
    createdAt: Date;
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
