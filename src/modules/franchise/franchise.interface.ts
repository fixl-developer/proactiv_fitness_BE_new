import { Document } from 'mongoose';

export enum FranchiseStatus {
    PROSPECT = 'prospect',
    ONBOARDING = 'onboarding',
    ACTIVE = 'active',
    SUSPENDED = 'suspended',
    TERMINATED = 'terminated'
}

export enum ContractStatus {
    DRAFT = 'draft',
    PENDING_SIGNATURE = 'pending_signature',
    ACTIVE = 'active',
    EXPIRED = 'expired',
    TERMINATED = 'terminated',
    RENEWED = 'renewed'
}

export enum RoyaltyType {
    PERCENTAGE = 'percentage',
    FIXED = 'fixed',
    TIERED = 'tiered',
    HYBRID = 'hybrid'
}

export enum RevenueShareType {
    GROSS_REVENUE = 'gross_revenue',
    NET_REVENUE = 'net_revenue',
    PROFIT_SHARE = 'profit_share'
}

export interface IFranchise extends Document {
    // Basic Information
    franchiseId: string;
    franchiseName: string;
    legalEntityName: string;
    brandName: string;

    // Franchisee Details
    franchiseeInfo: {
        primaryContactName: string;
        primaryContactEmail: string;
        primaryContactPhone: string;
        secondaryContactName?: string;
        secondaryContactEmail?: string;
        secondaryContactPhone?: string;
        businessAddress: {
            street: string;
            city: string;
            state: string;
            country: string;
            postalCode: string;
        };
    };

    // Status
    status: FranchiseStatus;
    onboardingDate?: Date;
    activationDate?: Date;
    suspensionDate?: Date;
    terminationDate?: Date;

    // Contract Details
    contractInfo: {
        contractId: string;
        contractStatus: ContractStatus;
        signedDate?: Date;
        effectiveDate: Date;
        expirationDate: Date;
        renewalTerms: string;
        autoRenewal: boolean;
        noticePeriod: number; // in days
        contractDocumentUrl?: string;
    };

    // Financial Terms
    financialTerms: {
        initialFranchiseFee: number;
        royaltyType: RoyaltyType;
        royaltyRate?: number; // percentage
        royaltyFixedAmount?: number;
        royaltyTiers?: {
            minRevenue: number;
            maxRevenue: number;
            rate: number;
        }[];
        marketingFeeRate: number; // percentage
        technologyFeeRate: number; // percentage
        minimumRoyalty?: number;
        paymentFrequency: 'weekly' | 'monthly' | 'quarterly';
        paymentDueDay: number;
        currency: string;
    };

    // Revenue Sharing
    revenueSharing: {
        shareType: RevenueShareType;
        franchiseeShare: number; // percentage
        franchisorShare: number; // percentage
        revenueCategories: {
            category: string;
            franchiseeShare: number;
            franchisorShare: number;
        }[];
    };

    // White-Label Configuration
    whiteLabelConfig: {
        isWhiteLabeled: boolean;
        customBrandName?: string;
        customLogoUrl?: string;
        customColorScheme?: {
            primary: string;
            secondary: string;
            accent: string;
        };
        customDomain?: string;
        customEmailDomain?: string;
        hideParentBrand: boolean;
    };

    // Multi-Brand Support
    brands: {
        brandId: string;
        brandName: string;
        isActive: boolean;
        launchDate: Date;
    }[];

    // Locations
    locations: {
        locationId: string;
        locationName: string;
        address: string;
        isActive: boolean;
        openingDate: Date;
    }[];

    // Performance Metrics
    performanceMetrics: {
        totalRevenue: number;
        totalRoyaltiesPaid: number;
        totalMarketingFeesPaid: number;
        averageMonthlyRevenue: number;
        revenueGrowthRate: number;
        activeMembers: number;
        memberGrowthRate: number;
        complianceScore: number; // 0-100
    };

    // Support & Training
    supportInfo: {
        assignedAccountManager: string;
        lastTrainingDate?: Date;
        nextTrainingDate?: Date;
        supportTicketsOpen: number;
        supportTicketsResolved: number;
        trainingModulesCompleted: number;
        trainingModulesTotal: number;
    };

    // Compliance
    compliance: {
        lastAuditDate?: Date;
        nextAuditDate?: Date;
        complianceIssues: {
            issueId: string;
            issueType: string;
            description: string;
            severity: 'low' | 'medium' | 'high' | 'critical';
            reportedDate: Date;
            resolvedDate?: Date;
            status: 'open' | 'in_progress' | 'resolved';
        }[];
        certifications: {
            certificationType: string;
            issuedDate: Date;
            expiryDate: Date;
            certificateUrl?: string;
        }[];
    };

    // Business Context
    businessUnitId: string;
    regionId: string;
    countryId: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IRoyaltyCalculation extends Document {
    // Calculation Information
    calculationId: string;
    franchiseId: string;
    franchiseName: string;

    // Period
    periodStart: Date;
    periodEnd: Date;
    periodType: 'weekly' | 'monthly' | 'quarterly';

    // Revenue Details
    revenueBreakdown: {
        grossRevenue: number;
        deductions: {
            refunds: number;
            discounts: number;
            chargebacks: number;
            other: number;
        };
        netRevenue: number;
    };

    // Royalty Calculation
    royaltyCalculation: {
        royaltyType: RoyaltyType;
        royaltyRate?: number;
        royaltyAmount: number;
        minimumRoyalty?: number;
        actualRoyalty: number;
    };

    // Additional Fees
    additionalFees: {
        marketingFee: number;
        technologyFee: number;
        otherFees: {
            feeName: string;
            amount: number;
        }[];
        totalAdditionalFees: number;
    };

    // Total Amount Due
    totalAmountDue: number;
    dueDate: Date;

    // Payment Status
    paymentStatus: 'pending' | 'paid' | 'overdue' | 'disputed' | 'waived';
    paidDate?: Date;
    paidAmount?: number;
    paymentMethod?: string;
    transactionId?: string;

    // Adjustments
    adjustments: {
        adjustmentId: string;
        adjustmentType: 'credit' | 'debit';
        amount: number;
        reason: string;
        approvedBy: string;
        date: Date;
    }[];

    // Notes
    notes?: string;

    // Business Context
    businessUnitId: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IFranchisePL extends Document {
    // P&L Information
    plId: string;
    franchiseId: string;
    franchiseName: string;

    // Period
    periodStart: Date;
    periodEnd: Date;
    periodType: 'monthly' | 'quarterly' | 'yearly';

    // Revenue
    revenue: {
        membershipFees: number;
        programFees: number;
        eventFees: number;
        merchandiseSales: number;
        otherRevenue: number;
        totalRevenue: number;
    };

    // Cost of Goods Sold
    cogs: {
        instructorCosts: number;
        facilityCosts: number;
        equipmentCosts: number;
        materialCosts: number;
        totalCOGS: number;
    };

    // Gross Profit
    grossProfit: number;
    grossMargin: number; // percentage

    // Operating Expenses
    operatingExpenses: {
        salaries: number;
        rent: number;
        utilities: number;
        marketing: number;
        insurance: number;
        maintenance: number;
        technology: number;
        administrative: number;
        otherExpenses: number;
        totalOperatingExpenses: number;
    };

    // Franchise Fees
    franchiseFees: {
        royaltyFees: number;
        marketingFees: number;
        technologyFees: number;
        otherFees: number;
        totalFranchiseFees: number;
    };

    // EBITDA
    ebitda: number;
    ebitdaMargin: number; // percentage

    // Net Profit
    netProfit: number;
    netMargin: number; // percentage

    // Key Metrics
    keyMetrics: {
        revenuePerMember: number;
        costPerMember: number;
        profitPerMember: number;
        breakEvenPoint: number;
        cashFlow: number;
    };

    // Comparisons
    comparisons: {
        previousPeriodRevenue: number;
        revenueGrowth: number; // percentage
        previousPeriodProfit: number;
        profitGrowth: number; // percentage
        industryBenchmark?: number;
        performanceVsBenchmark?: number;
    };

    // Business Context
    businessUnitId: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IFranchiseContract extends Document {
    // Contract Information
    contractId: string;
    franchiseId: string;
    franchiseName: string;

    // Contract Details
    contractType: 'initial' | 'renewal' | 'amendment';
    contractNumber: string;
    contractTitle: string;

    // Parties
    parties: {
        franchisor: {
            name: string;
            legalEntity: string;
            signatory: string;
            signatoryTitle: string;
        };
        franchisee: {
            name: string;
            legalEntity: string;
            signatory: string;
            signatoryTitle: string;
        };
    };

    // Terms
    terms: {
        effectiveDate: Date;
        expirationDate: Date;
        termLength: number; // in months
        renewalOptions: number;
        renewalTermLength: number; // in months
        autoRenewal: boolean;
        noticePeriod: number; // in days
    };

    // Financial Terms
    financialTerms: {
        initialFee: number;
        royaltyStructure: any;
        marketingFee: number;
        technologyFee: number;
        minimumPerformance?: number;
    };

    // Territory
    territory: {
        exclusiveTerritory: boolean;
        territoryDescription: string;
        geographicBounds?: string;
        populationSize?: number;
    };

    // Obligations
    obligations: {
        franchisorObligations: string[];
        franchiseeObligations: string[];
        trainingRequirements: string[];
        reportingRequirements: string[];
    };

    // Status
    status: ContractStatus;

    // Signatures
    signatures: {
        franchisorSignature?: {
            signedBy: string;
            signedDate: Date;
            signatureUrl?: string;
            ipAddress?: string;
        };
        franchiseeSignature?: {
            signedBy: string;
            signedDate: Date;
            signatureUrl?: string;
            ipAddress?: string;
        };
    };

    // Documents
    documents: {
        documentType: string;
        documentName: string;
        documentUrl: string;
        uploadedDate: Date;
        version: string;
    }[];

    // Amendments
    amendments: {
        amendmentId: string;
        amendmentDate: Date;
        amendmentDescription: string;
        amendmentDocumentUrl?: string;
        approvedBy: string;
    }[];

    // Termination
    terminationInfo?: {
        terminationDate: Date;
        terminationReason: string;
        terminatedBy: 'franchisor' | 'franchisee' | 'mutual';
        noticePeriodComplied: boolean;
        settlementAmount?: number;
        settlementPaid?: boolean;
    };

    // Business Context
    businessUnitId: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Request/Response Interfaces

export interface ICreateFranchiseRequest {
    franchiseName: string;
    legalEntityName: string;
    brandName: string;
    franchiseeInfo: any;
    contractInfo: any;
    financialTerms: any;
}

export interface ICalculateRoyaltyRequest {
    franchiseId: string;
    periodStart: Date;
    periodEnd: Date;
    grossRevenue: number;
    deductions?: any;
}

export interface IGeneratePLRequest {
    franchiseId: string;
    periodStart: Date;
    periodEnd: Date;
}

export interface IFranchiseSummary {
    franchiseId: string;
    franchiseName: string;
    status: FranchiseStatus;
    totalLocations: number;
    totalRevenue: number;
    totalRoyaltiesPaid: number;
    activeMembers: number;
    complianceScore: number;
    contractExpiryDate: Date;
}

export interface IFranchiseDashboard {
    franchiseId: string;
    franchiseName: string;
    overview: {
        status: FranchiseStatus;
        activeSince: Date;
        totalLocations: number;
        totalMembers: number;
    };
    financial: {
        currentMonthRevenue: number;
        lastMonthRevenue: number;
        revenueGrowth: number;
        outstandingRoyalties: number;
        nextPaymentDue: Date;
    };
    performance: {
        complianceScore: number;
        memberSatisfaction: number;
        revenuePerLocation: number;
        profitMargin: number;
    };
    alerts: {
        type: string;
        message: string;
        severity: string;
        date: Date;
    }[];
}
