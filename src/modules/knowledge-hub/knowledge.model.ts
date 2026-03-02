import mongoose, { Schema } from 'mongoose';
import { IKnowledgeDocument, IDocumentCategory, IDocumentAccessLog, ISearchIndex } from './knowledge.interface';

const KnowledgeDocumentSchema = new Schema<IKnowledgeDocument>(
    {
        documentId: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        documentType: { type: String, enum: ['sop', 'policy', 'procedure', 'guideline', 'template', 'training', 'other'], required: true },
        category: { type: String, required: true, index: true },
        tags: [String],

        content: {
            format: { type: String, enum: ['markdown', 'html', 'pdf', 'video', 'link'], required: true },
            body: String,
            fileUrl: String,
            videoUrl: String,
            externalLink: String
        },

        version: { type: String, required: true, default: '1.0' },
        versionHistory: [{
            version: { type: String, required: true },
            changes: { type: String, required: true },
            changedBy: { type: String, required: true },
            changedAt: { type: Date, default: Date.now },
            fileUrl: String
        }],

        status: { type: String, enum: ['draft', 'review', 'approved', 'published', 'archived'], default: 'draft' },

        approvalWorkflow: {
            required: { type: Boolean, default: false },
            approvers: [String],
            currentApprover: String,
            approvedBy: [String],
            rejectedBy: [String],
            comments: String
        },

        accessControl: {
            visibility: { type: String, enum: ['public', 'internal', 'restricted'], default: 'internal' },
            allowedRoles: [String],
            allowedUsers: [String],
            allowedLocations: [String]
        },

        metadata: {
            author: {
                userId: { type: String, required: true },
                userName: { type: String, required: true }
            },
            lastModifiedBy: {
                userId: { type: String, required: true },
                userName: { type: String, required: true }
            },
            publishedDate: Date,
            expiryDate: Date,
            reviewDate: Date
        },

        analytics: {
            views: { type: Number, default: 0 },
            downloads: { type: Number, default: 0 },
            likes: { type: Number, default: 0 },
            shares: { type: Number, default: 0 }
        },

        relatedDocuments: [String],

        attachments: [{
            fileName: String,
            fileUrl: String,
            fileSize: Number,
            uploadedAt: { type: Date, default: Date.now }
        }],

        businessUnitId: { type: String, required: true, index: true },
        locationId: { type: String, index: true },

        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'knowledge_documents' }
);

const DocumentCategorySchema = new Schema<IDocumentCategory>(
    {
        categoryId: { type: String, required: true, unique: true },
        categoryName: { type: String, required: true },
        description: { type: String, required: true },
        parentCategoryId: { type: String, index: true },
        icon: String,
        color: String,
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        businessUnitId: { type: String, required: true, index: true },
        createdBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'document_categories' }
);

const DocumentAccessLogSchema = new Schema<IDocumentAccessLog>(
    {
        logId: { type: String, required: true, unique: true },
        documentId: { type: String, required: true, index: true },
        userId: { type: String, required: true, index: true },
        userName: { type: String, required: true },
        action: { type: String, enum: ['view', 'download', 'edit', 'share', 'delete'], required: true },
        ipAddress: String,
        userAgent: String,
        accessedAt: { type: Date, default: Date.now, index: true }
    },
    { timestamps: false, collection: 'document_access_logs' }
);

const SearchIndexSchema = new Schema<ISearchIndex>(
    {
        indexId: { type: String, required: true, unique: true },
        documentId: { type: String, required: true, index: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
        tags: [String],
        category: { type: String, index: true },
        keywords: [String],
        lastIndexed: { type: Date, default: Date.now }
    },
    { timestamps: false, collection: 'search_indexes' }
);

KnowledgeDocumentSchema.index({ title: 'text', description: 'text', tags: 'text' });
KnowledgeDocumentSchema.index({ status: 1, category: 1 });
KnowledgeDocumentSchema.index({ 'metadata.publishedDate': -1 });

export const KnowledgeDocument = mongoose.model<IKnowledgeDocument>('KnowledgeDocument', KnowledgeDocumentSchema);
export const DocumentCategory = mongoose.model<IDocumentCategory>('DocumentCategory', DocumentCategorySchema);
export const DocumentAccessLog = mongoose.model<IDocumentAccessLog>('DocumentAccessLog', DocumentAccessLogSchema);
export const SearchIndex = mongoose.model<ISearchIndex>('SearchIndex', SearchIndexSchema);
