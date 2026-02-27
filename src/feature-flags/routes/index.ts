/**
 * Feature Flags Routes
 * 
 * Express routes for feature flag evaluation and management
 */

import { Router } from 'express';
import { FeatureFlagsController } from '../controllers/feature-flags.controller';
import { authenticate } from '../../modules/iam/auth.middleware';
import { rateLimitMiddleware } from '../../middleware/rate-limit.middleware';
import { validationMiddleware } from '../../middleware/validation.middleware';

export function createFeatureFlagsRoutes(controller: FeatureFlagsController): Router {
    const router = Router();

    // Apply authentication to all routes
    router.use(authenticate);

    // Apply rate limiting
    router.use(rateLimitMiddleware({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // 1000 requests per window
        message: 'Too many feature flag requests'
    }));

    // Flag evaluation endpoints
    router.post('/evaluate', controller.evaluateFlag);
    router.post('/evaluate-bulk', controller.evaluateBulkFlags);

    // Flag management endpoints
    router.post('/flags', controller.createFlag);
    router.get('/flags/:flagKey', controller.getFlag);
    router.put('/flags/:flagKey', controller.updateFlag);
    router.delete('/flags/:flagKey', controller.deleteFlag);
    router.get('/flags', controller.queryFlags);

    // Version management endpoints
    router.get('/flags/:flagKey/versions', controller.getFlagVersions);
    router.post('/flags/:flagKey/rollback', controller.rollbackFlag);

    // Health check
    router.get('/health', controller.healthCheck);

    return router;
}