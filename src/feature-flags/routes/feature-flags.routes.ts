import { Router } from 'express';
import { FeatureFlagsController } from '../controllers/feature-flags.controller';
import { FeatureFlagsService } from '../feature-flags.service';
import { authMiddleware } from '../../modules/iam/auth.middleware';
import { createRateLimitMiddleware } from '../../middleware/rate-limit.middleware';

export function createFeatureFlagsRoutes(featureFlagsService: FeatureFlagsService): Router {
    const router = Router();
    const controller: FeatureFlagsController = featureFlagsService.getController();

    // Apply authentication middleware to all routes
    router.use(authMiddleware);

    // Apply rate limiting
    router.use(createRateLimitMiddleware({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // limit each IP to 1000 requests per windowMs
    }));

    // Flag evaluation routes (high frequency)
    router.post('/evaluate/:flagKey', controller.evaluateFlag);
    router.post('/evaluate', controller.evaluateBulkFlags);

    // Flag management routes
    router.post('/flags', controller.createFlag);
    router.get('/flags/:flagKey', controller.getFlag);
    router.put('/flags/:flagKey', controller.updateFlag);
    router.delete('/flags/:flagKey', controller.deleteFlag);
    router.get('/flags', controller.queryFlags);

    // Health check
    router.get('/health', controller.healthCheck);

    return router;
}