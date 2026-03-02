import mongoose, { Schema } from 'mongoose';
import { IExportPack, IExportTemplate, IExportHistory } from './export.interface';

const ExportPackSchema = new Schema<IExportPack>(
    {
        exportId: { type: String, required: true, unique: true },
        exportType: { type: String, enum: ['parent_level', 'franchise_level', 'location_level', 'custom'], required: true },

        requestedBy: {
            userId: { type: String, required: true },
            userName: { type: String, required: true },
            userType: String,
            email: String
        },

        scope: {
            entityType: { type: String, enum: ['parent', 'student', 'franchise', 'location', 'business_unit'], required: true },
            entityId: { type: String, required: true },
            entityName: { type: String, required: true }
        },

        dataCategories: [{
            category: { type: String, required: true },
            included: { type: Boolean, default: true },
            recordCount: Number
        }],

        format: { type: String, enum: ['pdf', 'csv', 'json', 'excel', 'zip'], required: true },
        status: { type: String, enum: ['pending', 'processing', 'completed', 'failed', 'expired'], default: 'pending' },

        progress: {
            percentage: { type: Number, default: 0 },
            currentStep: { type: String, default: 'Initializing' },
            estimatedCompletion: Date
        },

        files: [{
            fileName: String,
            fileUrl: String,
            fileSize: Number,
            format: String,
            generatedAt: { type: Date, default: Date.now }
        }],

        metadata: {
            totalRecords: { type: Number, default: 0 },
            totalSize: { type: Number, default: 0 },
            dateRange: {
                from: Date,
                to: Date
            },
            includeArchived: { type: Boolean, default: false }
        },

        schedule: {
            isScheduled: { type: Boolean, default: false },
            frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly'] },
            nextRun: Date,
            lastRun: Date
        },

        expiryDate: { type: Date, required: true },
        downloadCount: { type: Number, default: 0 },
        lastDownloadedAt: Date,

        businessUnitId: { type: String, required: true, index: true },
        createdBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'export_packs' }
);

const ExportTemplateSchema = new Schema<IExportTemplate>(
    {
        templateId: { type: String, required: true, unique: true },
        templateName: { type: String, required: true },
        description: { type: String, required: true },
        exportType: { type: String, required: true },
        dataCategories: [String],
        format: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        usageCount: { type: Number, default: 0 },
        businessUnitId: { type: String, required: true, index: true },
        createdBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'export_templates' }
);

const ExportHistorySchema = new Schema<IExportHistory>(
    {
        historyId: { type: String, required: true, unique: true },
        exportId: { type: String, required: true, index: true },
        action: { type: String, enum: ['created', 'started', 'completed', 'failed', 'downloaded', 'expired', 'deleted'], required: true },
        performedBy: String,
        details: String,
        timestamp: { type: Date, default: Date.now }
    },
    { timestamps: false, collection: 'export_history' }
);

ExportPackSchema.index({ status: 1, createdAt: -1 });
ExportPackSchema.index({ 'requestedBy.userId': 1, createdAt: -1 });
ExportPackSchema.index({ expiryDate: 1 });

export const ExportPack = mongoose.model<IExportPack>('ExportPack', ExportPackSchema);
export const ExportTemplate = mongoose.model<IExportTemplate>('ExportTemplate', ExportTemplateSchema);
export const ExportHistory = mongoose.model<IExportHistory>('ExportHistory', ExportHistorySchema);
