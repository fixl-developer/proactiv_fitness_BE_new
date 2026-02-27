import { Router } from 'express';
import { FeatureFlagsController } from '../controllers/feature-flags.controller';
import { FeatureFlagsService } from '../feature-flags.service';
import { authMiddleware } from '../../modules/iam/auth.middleware';
import { rateLimitMiddleware } from '../../middleware/rate-limit.middleware';

export function createFeatureFlagsRoutes(featureFlagsService: FeatureFlagsService): Router {
    const router = Router();
    const controller = new FeatureFlagsController(featureFlagsService);

    // Apply authentication middleware to all routes
    router.use(authMiddleware);

    // Apply rate limiting
    router.use(rateLimitMiddleware({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // limit each IP to 1000 requests per windowMs
        message: 'Too many feature flag requests from this IP'
    }));

    // Flag evaluation routes (high frequency)
    router.post('/evaluate/:flagKey', controller.evaluateFlag);
    router.post('/evaluate', controller.evaluateFlags);

    // Flag management routes
    router.post('/flags', controller.createFlag);
    router.get('/flags/:flagKey', controller.getFlag);
    router.put('/flags/:flagKey', controller.updateFlag);
    router.delete('/flags/:flagKey', controller.deleteFlag);
    router.get('/flags', controller.listFlags);

    // Statistics and monitoring
    router.get('/statistics', controller.getStatistics);
    router.get('/health', controller.healthCheck);

    return router;
}