import { Router } from 'express';
import * as knowledgeController from './knowledge.controller';

const router = Router();

// Document Routes
router.post('/documents', knowledgeController.createDocument);
router.get('/documents', knowledgeController.getDocuments);
router.get('/documents/:documentId', knowledgeController.getDocument);
router.put('/documents/:documentId', knowledgeController.updateDocument);
router.post('/documents/approve', knowledgeController.approveDocument);
router.post('/documents/search', knowledgeController.searchDocuments);
router.get('/documents/:documentId/download', knowledgeController.downloadDocument);

// Category Routes
router.post('/categories', knowledgeController.createCategory);
router.get('/categories', knowledgeController.getCategories);

export default router;
