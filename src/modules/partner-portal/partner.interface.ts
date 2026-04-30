import { Document } from 'mongoose';

export enum PartnerType {
    SCHOOL = 'school',
    GYM = 'gym',
    CORPORATE = 'corporate',
    SPORTS_ACADEMY = 'sports_academy',
    NGO = 'ngo',
    MUNICIPAL = 'municipal',
    SPORTS_CLUB = 'sports_club',
    OTHER = 'other'
}

export enum PartnershipStatus {
    PROSPECT = 'prospect',
    NEGOTIATION = 'negotiation',
    ACTIVE = 'active',
    SUSPENDED = 'suspended',
    TERMINATED = 'terminated'
}

export interface IPartner extends Document {
    partnerId: string;
    partnerName: string;
    partnerType: PartnerType;
    legalEntityName: string;

    contactInfo: {
        primaryContactName: string;
        primaryContactEmail: string;
        primaryContactPhone: string;
        address: {
            street: string;
            city: string;
            state: string;
            country: string;
            postalCode: string;
        };
    };

    status: PartnershipStatus;
    partnershipStartDate?: Date;
    partnershipEndDate?: Date;

    revenueShare: {
        partnerShare: number;
        platformShare: number;
        paymentFrequency: 'monthly' | 'quarterly';
    };

    studentInfo: {
        totalStudents: number;
        activeStudents: number;
        enrolledPrograms: string[];
    };

    financialMetrics: {
        totalRevenue: number;
        partnerRevenue: number;
        platformRevenue: number;
    };

    complianceInfo: {
        lastAuditDate?: Date;
        nextAuditDate?: Date;
        complianceScore: number;
    };

    businessUnitId: string;
    locationId: string;

    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IBulkImport extends Document {
    importId: string;
    partnerId: string;
    partnerName: string;

    importDate: Date;
    importedBy: string;

    fileInfo: {
        fileName: string;
        fileUrl: string;
        fileSize: number;
        recordCount: number;
    };

    importStatus: 'pending' | 'processing' | 'completed' | 'failed';

    results: {
        totalRecords: number;
        successfulImports: number;
        failedImports: number;
        errors: {
            row: number;
            field: string;
            error: string;
        }[];
    };

    businessUnitId: string;

    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPartnerDashboard {
    partnerId: string;
    partnerName: string;
    overview: {
        status: PartnershipStatus;
        totalStudents: number;
        activeStudents: number;
        enrolledPrograms: number;
    };
    financial: {
        totalRevenue: number;
        partnerShare: number;
        platformShare: number;
        lastPaymentDate?: Date;
        nextPaymentDate?: Date;
    };
    performance: {
        studentGrowthRate: number;
        revenueGrowthRate: number;
        complianceScore: number;
    };
}

export interface ICreatePartnerRequest {
    partnerName: string;
    partnerType: PartnerType;
    legalEntityName: string;
    contactInfo: any;
    revenueShare: any;
}

export interface IBulkImportRequest {
    partnerId: string;
    fileUrl: string;
    fileName: string;
}
