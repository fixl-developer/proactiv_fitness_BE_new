import mongoose, { Schema } from 'mongoose';
import {
    IFranchise,
    IRoyaltyCalculation,
    IFranchisePL,
    IFranchiseContract,
    FranchiseStatus,
    ContractStatus,
    RoyaltyType,
    RevenueShareType
} from './franchise.interface';

const FranchiseSchema = new Schema<IFranchise>(
    {
        franchiseId: { type: String, required: true, unique: true },
        franchiseName: { type: String, required: true },
        legalEntityName: { type: String, required: true },
        brandName: { type: String, required: true },

        franchiseeInfo: {
            primaryContactName: { type: String, required: true },
            primaryContactEmail: { type: String, required: true },
            primaryContactPhone: { type: String, required: true },
            secondaryContactName: String,
            secondaryContactEmail: String,
            secondaryContactPhone: String,
            businessAddress: {
                street: String,
                city: String,
                state: String,
                country: String,
                postalCode: String
            }
        },

        status: { type: String, enum: Object.values(FranchiseStatus), default: FranchiseStatus.PROSPECT },
        onboardingDate: Date,
        activationDate: Date,
        suspensionDate: Date,
        terminationDate: Date,

        contractInfo: {
            contractId: String,
            contractStatus: { type: String, enum: Object.values(ContractStatus) },
            signedDate: Date,
            effectiveDate: Date,
            expirationDate: Date,
            renewalTerms: String,
            autoRenewal: Boolean,
            noticePeriod: Number,
            contractDocumentUrl: String
        },

        financialTerms: {
            initialFranchiseFee: { type: Number, required: true },
            royaltyType: { type: String, enum: Object.values(RoyaltyType), required: true },
            royaltyRate: Number,
            royaltyFixedAmount: Number,
            royaltyTiers: [{
                minRevenue: Number,
                maxRevenue: Number,
                rate: Number
            }],
            marketingFeeRate: { type: Number, default: 0 },
            technologyFeeRate: { type: Number, default: 0 },
            minimumRoyalty: Number,
            paymentFrequency: { type: String, enum: ['weekly', 'monthly', 'quarterly'], default: 'monthly' },
            paymentDueDay: { type: Number, default: 15 },
            currency: { type: String, default: 'USD' }
        },

        revenueSharing: {
            shareType: { type: String, enum: Object.values(RevenueShareType) },
            franchiseeShare: Number,
            franchisorShare: Number,
            revenueCategories: [{
                category: String,
                franchiseeShare: Number,
                franchisorShare: Number
            }]
        },

        whiteLabelConfig: {
            isWhiteLabeled: { type: Boolean, default: false },
            customBrandName: String,
            customLogoUrl: String,
            customColorScheme: {
                primary: String,
                secondary: String,
                accent: String
            },
            customDomain: String,
            customEmailDomain: String,
            hideParentBrand: { type: Boolean, default: false }
        },

        brands: [{
            brandId: String,
            brandName: String,
            isActive: Boolean,
            launchDate: Date
        }],

        locations: [{
            locationId: String,
            locationName: String,
            address: String,
            isActive: Boolean,
            openingDate: Date
        }],

        performanceMetrics: {
            totalRevenue: { type: Number, default: 0 },
            totalRoyaltiesPaid: { type: Number, default: 0 },
            totalMarketingFeesPaid: { type: Number, default: 0 },
            averageMonthlyRevenue: { type: Number, default: 0 },
            revenueGrowthRate: { type: Number, default: 0 },
            activeMembers: { type: Number, default: 0 },
            memberGrowthRate: { type: Number, default: 0 },
            complianceScore: { type: Number, default: 100, min: 0, max: 100 }
        },

        supportInfo: {
            assignedAccountManager: String,
            lastTrainingDate: Date,
            nextTrainingDate: Date,
            supportTicketsOpen: { type: Number, default: 0 },
            supportTicketsResolved: { type: Number, default: 0 },
            trainingModulesCompleted: { type: Number, default: 0 },
            trainingModulesTotal: { type: Number, default: 0 }
        },

        compliance: {
            lastAuditDate: Date,
            nextAuditDate: Date,
            complianceIssues: [{
                issueId: String,
                issueType: String,
                description: String,
                severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
                reportedDate: Date,
                resolvedDate: Date,
                status: { type: String, enum: ['open', 'in_progress', 'resolved'] }
            }],
            certifications: [{
                certificationType: String,
                issuedDate: Date,
                expiryDate: Date,
                certificateUrl: String
            }]
        },

        businessUnitId: { type: String, required: true, index: true },
        regionId: { type: String, required: true, index: true },
        countryId: { type: String, required: true, index: true },

        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true }
    },
    {
        timestamps: true,
        collection: 'franchises'
    }
);

const RoyaltyCalculationSchema = new Schema<IRoyaltyCalculation>(
    {
        calculationId: { type: String, required: true, unique: true },
        franchiseId: { type: String, required: true, index: true },
        franchiseName: { type: String, required: true },

        periodStart: { type: Date, required: true },
        periodEnd: { type: Date, required: true },
        periodType: { type: String, enum: ['weekly', 'monthly', 'quarterly'], required: true },

        revenueBreakdown: {
            grossRevenue: { type: Number, required: true },
            deductions: {
                refunds: { type: Number, default: 0 },
                discounts: { type: Number, default: 0 },
                chargebacks: { type: Number, default: 0 },
                other: { type: Number, default: 0 }
            },
            netRevenue: { type: Number, required: true }
        },

        royaltyCalculation: {
            royaltyType: { type: String, enum: Object.values(RoyaltyType), required: true },
            royaltyRate: Number,
            royaltyAmount: { type: Number, required: true },
            minimumRoyalty: Number,
            actualRoyalty: { type: Number, required: true }
        },

        additionalFees: {
            marketingFee: { type: Number, default: 0 },
            technologyFee: { type: Number, default: 0 },
            otherFees: [{
                feeName: String,
                amount: Number
            }],
            totalAdditionalFees: { type: Number, default: 0 }
        },

        totalAmountDue: { type: Number, required: true },
        dueDate: { type: Date, required: true },

        paymentStatus: { type: String, enum: ['pending', 'paid', 'overdue', 'disputed', 'waived'], default: 'pending' },
        paidDate: Date,
        paidAmount: Number,
        paymentMethod: String,
        transactionId: String,

        adjustments: [{
            adjustmentId: String,
            adjustmentType: { type: String, enum: ['credit', 'debit'] },
            amount: Number,
            reason: String,
            approvedBy: String,
            date: Date
        }],

        notes: String,

        businessUnitId: { type: String, required: true, index: true },

        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true }
    },
    {
        timestamps: true,
        collection: 'royalty_calculations'
    }
);

const FranchisePLSchema = new Schema<IFranchisePL>(
    {
        plId: { type: String, required: true, unique: true },
        franchiseId: { type: String, required: true, index: true },
        franchiseName: { type: String, required: true },

        periodStart: { type: Date, required: true },
        periodEnd: { type: Date, required: true },
        periodType: { type: String, enum: ['monthly', 'quarterly', 'yearly'], required: true },

        revenue: {
            membershipFees: { type: Number, default: 0 },
            programFees: { type: Number, default: 0 },
            eventFees: { type: Number, default: 0 },
            merchandiseSales: { type: Number, default: 0 },
            otherRevenue: { type: Number, default: 0 },
            totalRevenue: { type: Number, required: true }
        },

        cogs: {
            instructorCosts: { type: Number, default: 0 },
            facilityCosts: { type: Number, default: 0 },
            equipmentCosts: { type: Number, default: 0 },
            materialCosts: { type: Number, default: 0 },
            totalCOGS: { type: Number, required: true }
        },

        grossProfit: { type: Number, required: true },
        grossMargin: { type: Number, required: true },

        operatingExpenses: {
            salaries: { type: Number, default: 0 },
            rent: { type: Number, default: 0 },
            utilities: { type: Number, default: 0 },
            marketing: { type: Number, default: 0 },
            insurance: { type: Number, default: 0 },
            maintenance: { type: Number, default: 0 },
            technology: { type: Number, default: 0 },
            administrative: { type: Number, default: 0 },
            otherExpenses: { type: Number, default: 0 },
            totalOperatingExpenses: { type: Number, required: true }
        },

        franchiseFees: {
            royaltyFees: { type: Number, default: 0 },
            marketingFees: { type: Number, default: 0 },
            technologyFees: { type: Number, default: 0 },
            otherFees: { type: Number, default: 0 },
            totalFranchiseFees: { type: Number, required: true }
        },

        ebitda: { type: Number, required: true },
        ebitdaMargin: { type: Number, required: true },

        netProfit: { type: Number, required: true },
        netMargin: { type: Number, required: true },

        keyMetrics: {
            revenuePerMember: { type: Number, default: 0 },
            costPerMember: { type: Number, default: 0 },
            profitPerMember: { type: Number, default: 0 },
            breakEvenPoint: { type: Number, default: 0 },
            cashFlow: { type: Number, default: 0 }
        },

        comparisons: {
            previousPeriodRevenue: { type: Number, default: 0 },
            revenueGrowth: { type: Number, default: 0 },
            previousPeriodProfit: { type: Number, default: 0 },
            profitGrowth: { type: Number, default: 0 },
            industryBenchmark: Number,
            performanceVsBenchmark: Number
        },

        businessUnitId: { type: String, required: true, index: true },

        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true }
    },
    {
        timestamps: true,
        collection: 'franchise_pl'
    }
);

const FranchiseContractSchema = new Schema<IFranchiseContract>(
    {
        contractId: { type: String, required: true, unique: true },
        franchiseId: { type: String, required: true, index: true },
        franchiseName: { type: String, required: true },

        contractType: { type: String, enum: ['initial', 'renewal', 'amendment'], required: true },
        contractNumber: { type: String, required: true, unique: true },
        contractTitle: { type: String, required: true },

        parties: {
            franchisor: {
                name: String,
                legalEntity: String,
                signatory: String,
                signatoryTitle: String
            },
            franchisee: {
                name: String,
                legalEntity: String,
                signatory: String,
                signatoryTitle: String
            }
        },

        terms: {
            effectiveDate: { type: Date, required: true },
            expirationDate: { type: Date, required: true },
            termLength: { type: Number, required: true },
            renewalOptions: { type: Number, default: 0 },
            renewalTermLength: Number,
            autoRenewal: { type: Boolean, default: false },
            noticePeriod: { type: Number, default: 90 }
        },

        financialTerms: {
            initialFee: Number,
            royaltyStructure: Schema.Types.Mixed,
            marketingFee: Number,
            technologyFee: Number,
            minimumPerformance: Number
        },

        territory: {
            exclusiveTerritory: { type: Boolean, default: false },
            territoryDescription: String,
            geographicBounds: String,
            populationSize: Number
        },

        obligations: {
            franchisorObligations: [String],
            franchiseeObligations: [String],
            trainingRequirements: [String],
            reportingRequirements: [String]
        },

        status: { type: String, enum: Object.values(ContractStatus), default: ContractStatus.DRAFT },

        signatures: {
            franchisorSignature: {
                signedBy: String,
                signedDate: Date,
                signatureUrl: String,
                ipAddress: String
            },
            franchiseeSignature: {
                signedBy: String,
                signedDate: Date,
                signatureUrl: String,
                ipAddress: String
            }
        },

        documents: [{
            documentType: String,
            documentName: String,
            documentUrl: String,
            uploadedDate: Date,
            version: String
        }],

        amendments: [{
            amendmentId: String,
            amendmentDate: Date,
            amendmentDescription: String,
            amendmentDocumentUrl: String,
            approvedBy: String
        }],

        terminationInfo: {
            terminationDate: Date,
            terminationReason: String,
            terminatedBy: { type: String, enum: ['franchisor', 'franchisee', 'mutual'] },
            noticePeriodComplied: Boolean,
            settlementAmount: Number,
            settlementPaid: Boolean
        },

        businessUnitId: { type: String, required: true, index: true },

        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true }
    },
    {
        timestamps: true,
        collection: 'franchise_contracts'
    }
);

// Indexes
FranchiseSchema.index({ franchiseId: 1, status: 1 });
FranchiseSchema.index({ businessUnitId: 1, regionId: 1 });
RoyaltyCalculationSchema.index({ franchiseId: 1, periodStart: 1, periodEnd: 1 });
FranchisePLSchema.index({ franchiseId: 1, periodStart: 1, periodEnd: 1 });
FranchiseContractSchema.index({ franchiseId: 1, status: 1 });

export const Franchise = mongoose.model<IFranchise>('Franchise', FranchiseSchema);
export const RoyaltyCalculation = mongoose.model<IRoyaltyCalculation>('RoyaltyCalculation', RoyaltyCalculationSchema);
export const FranchisePL = mongoose.model<IFranchisePL>('FranchisePL', FranchisePLSchema);
export const FranchiseContract = mongoose.model<IFranchiseContract>('FranchiseContract', FranchiseContractSchema);
