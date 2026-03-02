import { Request, Response } from 'express';
import { KnowledgeHubService } from './knowledge.service';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { sendSuccess } from '../../shared/utils/response.util';

const knowledgeService = new KnowledgeHubService();

export const createDocument = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || 'system';
    const userName = (req as any).user?.userName || 'System User';

    const document = await knowledgeService.createDocument(req.body, userId, userName);
    sendSuccess(res, document, 'Document created successfully', 201);
});

export const getDocuments = asyncHandler(async (req: Request, res: Response) => {
    const documents = await knowledgeService.getDocuments(req.query);
    sendSuccess(res, documents, 'Documents retrieved successfully');
});

export const getDocument = asyncHandler(async (req: Request, res: Response) => {
    const { documentId } = req.params;
    const userId = (req as any).user?.userId || 'system';
    const userName = (req as any).user?.userName || 'System User';

    const document = await knowledgeService.getDocument(documentId, userId, userName);
    sendSuccess(res, document, 'Document retrieved successfully');
});

export const updateDocument = asyncHandler(async (req: Request, res: Response) => {
    const { documentId } = req.params;
    const userId = (req as any).user?.userId || 'system';
    const userName = (req as any).user?.userName || 'System User';

    const document = await knowledgeService.updateDocument(documentId, req.body, userId, userName);
    sendSuccess(res, document, 'Document updated successfully');
});

export const approveDocument = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || 'system';

    const document = await knowledgeService.approveDocument(req.body, userId);
    sendSuccess(res, document, 'Document approval processed successfully');
});

export const searchDocuments = asyncHandler(async (req: Request, res: Response) => {
    const documents = await knowledgeService.searchDocuments(req.body);
    sendSuccess(res, documents, 'Search completed successfully');
});

export const downloadDocument = asyncHandler(async (req: Request, res: Response) => {
    const { documentId } = req.params;
    const userId = (req as any).user?.userId || 'system';
    const userName = (req as any).user?.userName || 'System User';

    const download = await knowledgeService.downloadDocument(documentId, userId, userName);
    sendSuccess(res, download, 'Document download initiated');
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
    const { categoryName, description } = req.body;
    const userId = (req as any).user?.userId || 'system';

    const category = await knowledgeService.createCategory(categoryName, description, userId);
    sendSuccess(res, category, 'Category created successfully', 201);
});

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await knowledgeService.getCategories();
    sendSuccess(res, categories, 'Categories retrieved successfully');
});
