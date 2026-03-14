// Partner & Institutional Portal Data Models

export interface IPartnerProfile {
    partnerId: string;
    partnerName: string;
    partnerType: 'school' | 'corporate' | 'institution' | 'ngo';
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    website?: string;
    logo: string;
    status: 'active' | 'inactive' | 'pending';
    createdAt: Date;
    updatedAt: Date;
}

export interface IBulkStudentImport {
    importId: string;
    partnerId: string;
    centerId: string;
    importDate: Date;
    totalStudents: number;
    successfulImports: number;
    failedImports: number;
    students: StudentImportData[];
    status: 'pending' | 'processing' | 'completed' | 'failed';
    createdAt: Date;
}

export interface StudentImportData {
    studentId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: Date;
    parentName: string;
    parentEmail: string;
    parentPhone: string;
    programId: string;
    status: 'success' | 'failed';
    errorMessage?: string;
}

export interface IPartnerDashboard {
    dashboardId: string;
    partnerId: string;
    totalStudents: number;
    activePrograms: number;
    totalRevenue: number;
    monthlyRevenue: number;
    studentGrowth: number;
    engagementRate: number;
    satisfactionScore: number;
    lastUpdated: Date;
    createdAt: Date;
}

export interface IRevenueSharing {
    revenueSharingId: string;
    partnerId: string;
    centerId: string;
    period: 'monthly' | 'quarterly' | 'annual';
    startDate: Date;
    endDate: Date;
    totalRevenue: number;
    partnerShare: number;
    sharePercentage: number;
    paymentStatus: 'pending' | 'processed' | 'paid';
    paymentDate?: Date;
    createdAt: Date;
}

export interface IComplianceExport {
    exportId: string;
    partnerId: string;
    exportType: 'financial' | 'operations' | 'students' | 'staff' | 'compliance';
    exportDate: Date;
    data: any;
    format: 'pdf' | 'excel' | 'csv' | 'json';
    status: 'generated' | 'sent' | 'archived';
    createdAt: Date;
}

export interface ITenderDocumentation {
    tenderId: string;
    partnerId: string;
    tenderName: string;
    description: string;
    documents: TenderDocument[];
    submissionDate: Date;
    status: 'draft' | 'submitted' | 'approved' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}

export interface TenderDocument {
    documentId: string;
    name: string;
    type: string;
    url: string;
    uploadDate: Date;
}

export interface IMunicipalReporting {
    reportingId: string;
    partnerId: string;
    reportType: 'enrollment' | 'attendance' | 'performance' | 'compliance';
    reportingPeriod: string;
    submissionDate: Date;
    data: any;
    status: 'draft' | 'submitted' | 'approved';
    createdAt: Date;
}

export interface IPartnerAgreement {
    agreementId: string;
    partnerId: string;
    centerId: string;
    agreementType: 'revenue_share' | 'bulk_enrollment' | 'exclusive' | 'standard';
    startDate: Date;
    endDate: Date;
    terms: string;
    status: 'active' | 'expired' | 'terminated';
    createdAt: Date;
    updatedAt: Date;
}

export interface IPartnerPerformance {
    performanceId: string;
    partnerId: string;
    period: 'monthly' | 'quarterly' | 'annual';
    date: Date;
    studentEnrollment: number;
    studentRetention: number;
    programCompletion: number;
    satisfactionScore: number;
    revenueGenerated: number;
    createdAt: Date;
}

export interface IPartnerCommunication {
    communicationId: string;
    partnerId: string;
    type: 'email' | 'message' | 'notification' | 'report';
    subject: string;
    content: string;
    sentDate: Date;
    readDate?: Date;
    status: 'sent' | 'read' | 'archived';
    createdAt: Date;
}

export interface IPartnerSupport {
    supportId: string;
    partnerId: string;
    issueType: 'technical' | 'billing' | 'operational' | 'other';
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    assignedTo?: string;
    resolvedDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}
