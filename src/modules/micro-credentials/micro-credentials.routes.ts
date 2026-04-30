import { Router } from 'express';
import { MicroCredentialController } from './micro-credentials.controller';
import { authMiddleware } from '../iam/auth.middleware';

const router = Router();
const credentialController = new MicroCredentialController();

// Apply authentication middleware ONLY to /micro-credentials/* and /badges/* paths.
// (This router is mounted at '/' in routes/index.ts, so a bare router.use(authMiddleware)
//  would intercept every /api/v1/* request and break unrelated routes with 401s.)
router.use('/micro-credentials', authMiddleware);
router.use('/badges', authMiddleware);

// Credential Definition Routes
router.post('/micro-credentials', credentialController.createCredential);
router.get('/micro-credentials', credentialController.getCredentials);
router.get('/micro-credentials/statistics', credentialController.getCredentialStatistics);
router.get('/micro-credentials/:credentialId', credentialController.getCredential);

// Credential Issuance Routes
router.post('/micro-credentials/issue', credentialController.issueCredential);
router.get('/micro-credentials/issued', credentialController.getIssuedCredentials);
router.get('/micro-credentials/portfolio/:recipientId', credentialController.getCredentialPortfolio);

// Verification Routes
router.post('/micro-credentials/verify', credentialController.verifyCredential);

// Badge Definition Routes
router.post('/badges', credentialController.createBadge);
router.get('/badges', credentialController.getBadges);
router.get('/badges/statistics', credentialController.getBadgeStatistics);

// Badge Award Routes
router.post('/badges/award', credentialController.awardBadge);
router.get('/badges/earned', credentialController.getEarnedBadges);
router.get('/badges/collection/:recipientId', credentialController.getBadgeCollection);
router.patch('/badges/earned/:earnedBadgeId/display', credentialController.updateBadgeDisplay);

export { router as microCredentialRoutes };