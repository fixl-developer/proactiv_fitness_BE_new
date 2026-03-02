import { KnowledgeDocument, DocumentCategory, DocumentAccessLog, SearchIndex } from './knowledge.model';
import { ICreateDocumentRequest, IUpdateDocumentRequest, IApproveDocumentRequest, ISearchDocumentsRequest } from './knowledge.interface';
import { AppError } from '../../shared/utils/app-error.util';
import { v4 as uuidv4 } from 'uuid';

export class KnowledgeHubService {
    // Document Management
    async createDocument(data: ICreateDocumentRequest, userId: string, userName: string): Promise<any> {
        const documentId = uuidv4();

        const document = new KnowledgeDocument({
            documentId,
            title: data.title,
            description: data.description,
            documentType: data.documentType,
            category: data.category,
            tags: data.tags || [],
            content: data.content,
            version: '1.0',
            versionHistory: [{
                version: '1.0',
                changes: 'Initial version',
                changedBy: userId,
                changedAt: new Date()
            }],
            status: data.approvalRequired ? 'review' : 'draft',
            approvalWorkflow: data.approvalRequired ? {
                required: true,
                approvers: ['admin-001'],
                approvedBy: [],
                rejectedBy: []
            } : undefined,
            accessControl: data.accessControl || {
                visibility: 'internal',
                allowedRoles: ['admin', 'staff']
            },
            metadata: {
                author: {
                    userId,
                    userName
                },
                lastModifiedBy: {
                    userId,
                    userName
                }
            },
            businessUnitId: 'bu-001',
            createdBy: userId,
            updatedBy: userId
        });

        const savedDoc = await document.save();

        // Create search index
        await this.indexDocument(savedDoc);

        return savedDoc;
    }

    async getDocuments(filters: any): Promise<any[]> {
        const query: any = {};

        if (filters.documentType) query.documentType = filters.documentType;
        if (filters.category) query.category = filters.category;
        if (filters.status) query.status = filters.status;
        if (filters.tags) query.tags = { $in: filters.tags };

        return await KnowledgeDocument.find(query)
            .sort({ 'metadata.publishedDate': -1, createdAt: -1 })
            .limit(filters.limit || 50);
    }

    async getDocument(documentId: string, userId: string, userName: string): Promise<any> {
        const document = await KnowledgeDocument.findOne({ documentId });

        if (!document) {
            throw new AppError('Document not found', 404);
        }

        // Log access
        await this.logAccess(documentId, userId, userName, 'view');

        // Increment view count
        await KnowledgeDocument.findOneAndUpdate(
            { documentId },
            { $inc: { 'analytics.views': 1 } }
        );

        return document;
    }

    async updateDocument(documentId: string, data: IUpdateDocumentRequest, userId: string, userName: string): Promise<any> {
        const document = await KnowledgeDocument.findOne({ documentId });

        if (!document) {
            throw new AppError('Document not found', 404);
        }

        // Increment version
        const versionParts = document.version.split('.');
        const newVersion = `${versionParts[0]}.${parseInt(versionParts[1]) + 1}`;

        const updateData: any = {
            version: newVersion,
            'metadata.lastModifiedBy': {
                userId,
                userName
            },
            updatedBy: userId
        };

        if (data.title) updateData.title = data.title;
        if (data.description) updateData.description = data.description;
        if (data.content) updateData.content = data.content;
        if (data.tags) updateData.tags = data.tags;

        // Add to version history
        updateData.$push = {
            versionHistory: {
                version: newVersion,
                changes: data.changes,
                changedBy: userId,
                changedAt: new Date()
            }
        };

        const updatedDoc = await KnowledgeDocument.findOneAndUpdate(
            { documentId },
            updateData,
            { new: true }
        );

        // Update search index
        if (updatedDoc) {
            await this.indexDocument(updatedDoc);
        }

        // Log access
        await this.logAccess(documentId, userId, userName, 'edit');

        return updatedDoc;
    }

    async approveDocument(data: IApproveDocumentRequest, userId: string): Promise<any> {
        const document = await KnowledgeDocument.findOne({ documentId: data.documentId });

        if (!document) {
            throw new AppError('Document not found', 404);
        }

        if (!document.approvalWorkflow?.required) {
            throw new AppError('Document does not require approval', 400);
        }

        const updateData: any = {
            status: data.approved ? 'approved' : 'draft',
            'approvalWorkflow.comments': data.comments
        };

        if (data.approved) {
            updateData.$push = { 'approvalWorkflow.approvedBy': userId };
            updateData['metadata.publishedDate'] = new Date();
        } else {
            updateData.$push = { 'approvalWorkflow.rejectedBy': userId };
        }

        return await KnowledgeDocument.findOneAndUpdate(
            { documentId: data.documentId },
            updateData,
            { new: true }
        );
    }

    async searchDocuments(data: ISearchDocumentsRequest): Promise<any[]> {
        const query: any = {
            $text: { $search: data.query }
        };

        if (data.filters) {
            if (data.filters.documentType) query.documentType = data.filters.documentType;
            if (data.filters.category) query.category = data.filters.category;
            if (data.filters.status) query.status = data.filters.status;
            if (data.filters.tags) query.tags = { $in: data.filters.tags };
        }

        return await KnowledgeDocument.find(query)
            .sort({ score: { $meta: 'textScore' } })
            .limit(data.limit || 20);
    }

    // Category Management
    async createCategory(categoryName: string, description: string, userId: string): Promise<any> {
        const categoryId = uuidv4();

        const category = new DocumentCategory({
            categoryId,
            categoryName,
            description,
            businessUnitId: 'bu-001',
            createdBy: userId
        });

        return await category.save();
    }

    async getCategories(): Promise<any[]> {
        return await DocumentCategory.find({ isActive: true }).sort({ order: 1, categoryName: 1 });
    }

    // Helper Methods
    private async indexDocument(document: any): Promise<void> {
        const indexId = uuidv4();

        const searchIndex = new SearchIndex({
            indexId,
            documentId: document.documentId,
            title: document.title,
            content: document.content.body || document.description,
            tags: document.tags,
            category: document.category,
            keywords: this.extractKeywords(document.title + ' ' + document.description),
            lastIndexed: new Date()
        });

        await SearchIndex.findOneAndUpdate(
            { documentId: document.documentId },
            searchIndex,
            { upsert: true, new: true }
        );
    }

    private async logAccess(documentId: string, userId: string, userName: string, action: string): Promise<void> {
        const logId = uuidv4();

        const log = new DocumentAccessLog({
            logId,
            documentId,
            userId,
            userName,
            action,
            accessedAt: new Date()
        });

        await log.save();
    }

    private extractKeywords(text: string): string[] {
        // Simple keyword extraction (in production, use NLP library)
        const words = text.toLowerCase().split(/\s+/);
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
        return words.filter(word => word.length > 3 && !stopWords.includes(word)).slice(0, 10);
    }

    async downloadDocument(documentId: string, userId: string, userName: string): Promise<any> {
        const document = await KnowledgeDocument.findOne({ documentId });

        if (!document) {
            throw new AppError('Document not found', 404);
        }

        // Log download
        await this.logAccess(documentId, userId, userName, 'download');

        // Increment download count
        await KnowledgeDocument.findOneAndUpdate(
            { documentId },
            { $inc: { 'analytics.downloads': 1 } }
        );

        return {
            documentId: document.documentId,
            title: document.title,
            fileUrl: document.content.fileUrl,
            format: document.content.format
        };
    }
}
