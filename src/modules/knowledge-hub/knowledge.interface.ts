import { Document } from 'mongoose';

// Document Interface
export interface IKnowledgeDocument extends Document {
    documentId: string;
    title: string;
    description: string;
    documentType: 'sop' | 'policy' | 'procedure' | 'guideline' | 'template' | 'training' | 'other';
    category: string;
    tags: string[];
    content: {
        format: 'markdown' | 'html' | 'pdf' | 'video' | 'link';
        body?: string;
        fileUrl?: string;
        videoUrl?: string;
        externalLink?: string;
    };
    version: string;
    versionHistory: {
        version: string;
        changes: string;
        changedBy: string;
        changedAt: Date;
        fileUrl?: string;
    }[];
    status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
    approvalWorkflow?: {
        required: boolean;
        approvers: string[];
        currentApprover?: string;
        approvedBy?: string[];
        rejectedBy?: string[];
        comments?: string;
    };
    accessControl: {
        visibility: 'public' | 'internal' | 'restricted';
        allowedRoles: string[];
        allowedUsers?: string[];
        allowedLocations?: string[];
    };
    metadata: {
        author: {
            userId: string;
            userName: string;
        };
        lastModifiedBy: {
            userId: string;
            userName: string;
        };
        publishedDate?: Date;
        expiryDate?: Date;
        reviewDate?: Date;
    };
    analytics: {
        views: number;
        downloads: number;
        likes: number;
        shares: number;
    };
    relatedDocuments?: string[];
    attachments?: {
        fileName: string;
        fileUrl: string;
        fileSize: number;
        uploadedAt: Date;
    }[];
    businessUnitId: string;
    locationId?: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Document Category Interface
export interface IDocumentCategory extends Document {
    categoryId: string;
    categoryName: string;
    description: string;
    parentCategoryId?: string;
    icon?: string;
    color?: string;
    order: number;
    isActive: boolean;
    businessUnitId: string;
    createdBy: string;
    createdAt: Date;
}

// Document Access Log Interface
export interface IDocumentAccessLog extends Document {
    logId: string;
    documentId: string;
    userId: string;
    userName: string;
    action: 'view' | 'download' | 'edit' | 'share' | 'delete';
    ipAddress?: string;
    userAgent?: string;
    accessedAt: Date;
}

// Search Index Interface
export interface ISearchIndex extends Document {
    indexId: string;
    documentId: string;
    title: string;
    content: string;
    tags: string[];
    category: string;
    keywords: string[];
    lastIndexed: Date;
}

// Request Interfaces
export interface ICreateDocumentRequest {
    title: string;
    description: string;
    documentType: string;
    category: string;
    tags?: string[];
    content: any;
    accessControl?: any;
    approvalRequired?: boolean;
}

export interface IUpdateDocumentRequest {
    title?: string;
    description?: string;
    content?: any;
    tags?: string[];
    changes: string;
}

export interface IApproveDocumentRequest {
    documentId: string;
    approved: boolean;
    comments?: string;
}

export interface ISearchDocumentsRequest {
    query: string;
    filters?: {
        documentType?: string;
        category?: string;
        tags?: string[];
        status?: string;
    };
    limit?: number;
}
