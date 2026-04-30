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

// ===== Extended models for full partner portal integration =====

export interface IPartnerProgram {
    id: string;
    partnerId: string;
    name: string;
    description: string;
    category: string;
    status: 'active' | 'inactive';
    enrolledStudents: number;
    revenue: number;
    rating: number;
    createdAt: Date;
}

export interface IPartnerStudent {
    id: string;
    partnerId: string;
    name: string;
    email: string;
    phone: string;
    enrolledPrograms: number;
    totalSpent: number;
    status: 'active' | 'inactive';
    joinDate: Date;
    lastActivity: Date;
}

export interface IPartnerNotification {
    id: string;
    partnerId: string;
    type: 'alert' | 'update' | 'reminder' | 'announcement';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    actionUrl?: string;
}

export interface IPartnerDocument {
    id: string;
    partnerId: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: Date;
    expiresAt?: Date;
    status: 'active' | 'expired' | 'pending';
    size?: string;
    downloads?: number;
    rating?: number;
}

export interface IPartnerContact {
    id: string;
    partnerId: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    isPrimary: boolean;
}

export interface IPerformanceMetrics {
    totalRevenue: number;
    totalStudents: number;
    totalPrograms: number;
    averageRating: number;
    growthRate: number;
    conversionRate: number;
    retentionRate: number;
    customerSatisfaction: number;
}

export interface IPerformanceTrend {
    date: string;
    revenue: number;
    students: number;
    bookings: number;
    rating: number;
}

export interface IRevenueAnalytics {
    totalRevenue: number;
    averageRevenuePerStudent: number;
    averageRevenuePerProgram: number;
    revenueByProgram: { program: string; revenue: number }[];
    revenueByMonth: { month: string; revenue: number }[];
    revenueGrowth: number;
}

export interface IGoalProgress {
    goalId: string;
    goalName: string;
    targetValue: number;
    currentValue: number;
    progress: number;
    status: 'on-track' | 'at-risk' | 'off-track';
    dueDate: string;
}

export interface ICommission {
    id: string;
    partnerId: string;
    amount: number;
    rate: number;
    period: string;
    status: 'pending' | 'approved' | 'paid' | 'disputed';
    calculatedAt: Date;
    paidAt?: Date;
    notes?: string;
}

export interface ICommissionStats {
    totalCommissions: number;
    totalPaid: number;
    totalPending: number;
    averageCommission: number;
    highestCommission: number;
    lowestCommission: number;
}

export interface IMarketingCampaign {
    id: string;
    partnerId: string;
    name: string;
    status: 'active' | 'paused' | 'completed' | 'draft';
    type: 'email' | 'social' | 'display' | 'content';
    budget: number;
    spent: number;
    impressions: number;
    clicks: number;
    conversions: number;
    roi: number;
    startDate: Date;
    endDate: Date;
}

export interface IMarketingLead {
    id: string;
    partnerId: string;
    name: string;
    email: string;
    phone: string;
    source: string;
    status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
    interestLevel: 'high' | 'medium' | 'low';
    assignedTo?: string;
    createdAt: Date;
}

export interface IIntegration {
    id: string;
    partnerId: string;
    name: string;
    type: string;
    status: 'connected' | 'disconnected' | 'error';
    lastSync: Date;
    syncFrequency: string;
    dataPointsSynced: number;
    healthScore: number;
}

export interface ISupportTicket {
    id: string;
    partnerId: string;
    subject: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    assignedTo?: string;
    messages: ISupportMessage[];
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date;
}

export interface ISupportMessage {
    id: string;
    ticketId: string;
    sender: string;
    senderType: 'partner' | 'support';
    message: string;
    createdAt: Date;
}

