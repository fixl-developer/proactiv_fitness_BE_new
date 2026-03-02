import { Router } from 'express';
import * as deletionController from './deletion.controller';

const router = Router();

// Deletion Request Routes
router.post('/requests', deletionController.createDeletionRequest);
router.get('/requests', deletionController.getDeletionRequests);
router.get('/requests/:requestId', deletionController.getDeletionRequest);
router.post('/requests/approve', deletionController.approveDeletionRequest);
router.post('/requests/execute', deletionController.executeDeletion);
router.get('/requests/:requestId/certificate', deletionController.getCertificate);
router.get('/requests/:requestId/logs', deletionController.getAnonymizationLogs);

// Retention Policy Routes
router.post('/policies', deletionController.createRetentionPolicy);
router.get('/policies', deletionController.getRetentionPolicies);

export default router;
