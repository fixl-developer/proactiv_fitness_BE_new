export class CreatePartnerProfileDTO {
    partnerName: string;
    partnerType: 'school' | 'gym' | 'corporate' | 'sports_academy' | 'ngo' | 'municipal' | 'sports_club' | 'other';
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    website?: string;
    logo: string;
}

export class BulkImportStudentsDTO {
    partnerId: string;
    centerId: string;
    students: any[];
}

export class GenerateComplianceExportDTO {
    partnerId: string;
    exportType: 'financial' | 'operations' | 'students' | 'staff' | 'compliance';
    format: 'pdf' | 'excel' | 'csv' | 'json';
}

export class SubmitTenderDocumentationDTO {
    partnerId: string;
    tenderName: string;
    description: string;
    documents: any[];
}

export class SubmitMunicipalReportDTO {
    partnerId: string;
    reportType: 'enrollment' | 'attendance' | 'performance' | 'compliance';
    reportingPeriod: string;
    data: any;
}

export class CreatePartnerAgreementDTO {
    partnerId: string;
    centerId: string;
    agreementType: 'revenue_share' | 'bulk_enrollment' | 'exclusive' | 'standard';
    startDate: Date;
    endDate: Date;
    terms: string;
}

export class SendPartnerCommunicationDTO {
    partnerId: string;
    type: 'email' | 'message' | 'notification' | 'report';
    subject: string;
    content: string;
}

export class CreateSupportTicketDTO {
    partnerId: string;
    issueType: 'technical' | 'billing' | 'operational' | 'other';
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
}
