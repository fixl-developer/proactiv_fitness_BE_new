import mongoose, { Schema } from 'mongoose';
import { IPartner, IBulkImport, PartnerType, PartnershipStatus } from './partner.interface';

const PartnerSchema = new Schema<IPartner>(
    {
        partnerId: { type: String, required: true, unique: true },
        partnerName: { type: String, required: true },
        partnerType: { type: String, enum: Object.values(PartnerType), required: true },
        legalEntityName: { type: String, required: true },

        contactInfo: {
            primaryContactName: { type: String, required: true },
            primaryContactEmail: { type: String, required: true },
            primaryContactPhone: { type: String, required: true },
            address: {
                street: String,
                city: String,
                state: String,
                country: String,
                postalCode: String
            }
        },

        status: { type: String, enum: Object.values(PartnershipStatus), default: PartnershipStatus.PROSPECT },
        partnershipStartDate: Date,
        partnershipEndDate: Date,

        revenueShare: {
            partnerShare: { type: Number, required: true },
            platformShare: { type: Number, required: true },
            paymentFrequency: { type: String, enum: ['monthly', 'quarterly'], default: 'monthly' }
        },

        studentInfo: {
            totalStudents: { type: Number, default: 0 },
            activeStudents: { type: Number, default: 0 },
            enrolledPrograms: [String]
        },

        financialMetrics: {
            totalRevenue: { type: Number, default: 0 },
            partnerRevenue: { type: Number, default: 0 },
            platformRevenue: { type: Number, default: 0 }
        },

        complianceInfo: {
            lastAuditDate: Date,
            nextAuditDate: Date,
            complianceScore: { type: Number, default: 100, min: 0, max: 100 }
        },

        businessUnitId: { type: String, required: true, index: true },
        locationId: { type: String, required: true, index: true },

        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'partners' }
);

const BulkImportSchema = new Schema<IBulkImport>(
    {
        importId: { type: String, required: true, unique: true },
        partnerId: { type: String, required: true, index: true },
        partnerName: { type: String, required: true },

        importDate: { type: Date, default: Date.now },
        importedBy: { type: String, required: true },

        fileInfo: {
            fileName: String,
            fileUrl: String,
            fileSize: Number,
            recordCount: Number
        },

        importStatus: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },

        results: {
            totalRecords: { type: Number, default: 0 },
            successfulImports: { type: Number, default: 0 },
            failedImports: { type: Number, default: 0 },
            errors: [{
                row: Number,
                field: String,
                error: String
            }]
        },

        businessUnitId: { type: String, required: true, index: true },

        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'bulk_imports' }
);

export const Partner = mongoose.model<IPartner>('Partner', PartnerSchema);
export const BulkImport = mongoose.model<IBulkImport>('BulkImport', BulkImportSchema);
