import { Router } from 'express';
import * as exportController from './export.controller';

const router = Router();

// Export Pack Routes
router.post('/exports', exportController.createExport);
router.post('/exports/parent', exportController.createParentExport);
router.post('/exports/franchise', exportController.createFranchiseExport);
router.get('/exports', exportController.getExports);
router.get('/exports/:exportId', exportController.getExport);
router.get('/exports/:exportId/download', exportController.downloadExport);
router.post('/exports/schedule', exportController.scheduleExport);
router.get('/exports/:exportId/history', exportController.getExportHistory);

// Template Routes
router.post('/templates', exportController.createTemplate);
router.get('/templates', exportController.getTemplates);

export default router;
