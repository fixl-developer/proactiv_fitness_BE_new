import mongoose, { Schema } from 'mongoose';
import { IDeletionRequest, IRetentionPolicy, IAnonymizationLog, IDeletionCertificate } from './deletion.interface';

const DeletionRequestSchema = new Schema<IDeletionRequest>(
    {
        requestId: { type: String, required: true, unique: true },
        requestType: { type: String, enum: ['right_to_delete', 'enterprise_exit', 'account_closure', 'data_cleanup'], required: true },

        requestedBy: {
            userId: { type: String, required: true },
            userName: { type: String, required: true },
            userType: String,
            email: String
        },

        scope: {
            entityType: { type: String, enum: ['user', 'student', 'parent', 'franchise', 'location'], required: true },
            entityId: { type: String, required: true },
            entityName: { type: String, required: true }
        },

        reason: { type: String, required: true },
        status: { type: String, enum: ['pending', 'under_review', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled'], default: 'pending' },

        approvalWorkflow: {
            required: { type: Boolean, default: true },
            approvers: [{
                userId: String,
                userName: String,
                role: String,
                status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
                comments: String,
                timestamp: Date
            }],
            finalApprover: String,
            approvedAt: Date
        },

        retentionCheck: {
            hasLegalHold: { type: Boolean, default: false },
            legalHoldReasons: [String],
            retentionPeriod: Number,
            retentionEndDate: Date,
            canDelete: { type: Boolean, default: true }
        },

        dataInventory: [{
            category: String,
            recordCount: Number,
            dataSize: Number,
            location: String,
            canAnonymize: Boolean,
            mustRetain: Boolean,
            retentionReason: String
        }],

        deletionPlan: {
            totalRecords: { type: Number, default: 0 },
            recordsToDelete: { type: Number, default: 0 },
            recordsToAnonymize: { type: Number, default: 0 },
            recordsToRetain: { type: Number, default: 0 },
            estimatedDuration: { type: Number, default: 0 }
        },

        execution: {
            startedAt: Date,
            completedAt: Date,
            progress: {
                percentage: { type: Number, default: 0 },
                currentStep: { type: String, default: 'Not started' },
                recordsProcessed: { type: Number, default: 0 }
            },
            errors: [{
                category: String,
                error: String,
                timestamp: Date
            }]
        },

        certificate: {
            certificateId: String,
            certificateUrl: String,
            generatedAt: Date,
            verificationCode: String
        },

        businessUnitId: { type: String, required: true, index: true },
        createdBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'deletion_requests' }
);

const RetentionPolicySchema = new Schema<IRetentionPolicy>(
    {
        policyId: { type: String, required: true, unique: true },
        policyName: { type: String, required: true },
        description: { type: String, required: true },
        dataCategory: { type: String, required: true, index: true },
        retentionPeriod: { type: Number, required: true },
        retentionUnit: { type: String, enum: ['days', 'months', 'years'], required: true },
        legalBasis: { type: String, required: true },
        jurisdiction: { type: String, required: true },
        isActive: { type: Boolean, default: true },

        exceptions: [{
            condition: String,
            extendedPeriod: Number,
            reason: String
        }],

        businessUnitId: { type: String, required: true, index: true },
        createdBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'retention_policies' }
);

const AnonymizationLogSchema = new Schema<IAnonymizationLog>(
    {
        logId: { type: String, required: true, unique: true },
        requestId: { type: String, required: true, index: true },
        dataCategory: { type: String, required: true },
        recordId: { type: String, required: true },
        originalData: Schema.Types.Mixed,
        anonymizedData: Schema.Types.Mixed,
        anonymizationMethod: { type: String, enum: ['hash', 'mask', 'generalize', 'suppress', 'pseudonymize'], required: true },
        performedBy: { type: String, required: true },
        performedAt: { type: Date, default: Date.now }
    },
    { timestamps: false, collection: 'anonymization_logs' }
);

const DeletionCertificateSchema = new Schema<IDeletionCertificate>(
    {
        certificateId: { type: String, required: true, unique: true },
        requestId: { type: String, required: true, index: true },
        entityType: { type: String, required: true },
        entityId: { type: String, required: true },
        entityName: { type: String, required: true },

        deletionSummary: {
            totalRecordsDeleted: { type: Number, required: true },
            totalRecordsAnonymized: { type: Number, required: true },
            totalRecordsRetained: { type: Number, required: true },
            categoriesProcessed: [String]
        },

        legalStatement: { type: String, required: true },
        verificationCode: { type: String, required: true },

        issuedBy: {
            userId: { type: String, required: true },
            userName: { type: String, required: true },
            role: String
        },

        issuedAt: { type: Date, default: Date.now },
        certificateUrl: String
    },
    { timestamps: false, collection: 'deletion_certificates' }
);

DeletionRequestSchema.index({ status: 1, createdAt: -1 });
DeletionRequestSchema.index({ 'requestedBy.userId': 1 });
DeletionRequestSchema.index({ 'scope.entityId': 1 });

export const DeletionRequest = mongoose.model<IDeletionRequest>('DeletionRequest', DeletionRequestSchema);
export const RetentionPolicy = mongoose.model<IRetentionPolicy>('RetentionPolicy', RetentionPolicySchema);
export const AnonymizationLog = mongoose.model<IAnonymizationLog>('AnonymizationLog', AnonymizationLogSchema);
export const DeletionCertificate = mongoose.model<IDeletionCertificate>('DeletionCertificate', DeletionCertificateSchema);
