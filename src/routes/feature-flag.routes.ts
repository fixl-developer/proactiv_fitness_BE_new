import { Router } from 'express';
import { FeatureFlagsController } from '../controllers/feature-flags.controller';
import { authenticate, authorize } from '../modules/iam/auth.middleware';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';
import { UserRole } from '../shared/enums';

// Note: This route will be initialized with service instances in app.ts
export function createFeatureFlagRoutes(controller: FeatureFlagsController): Router {
    const router = Router();

    // Apply authentication to all routes
    router.use(authenticate);

    // Apply rate limiting
    router.use(rateLimitMiddleware({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // 1000 requests per window
        message: 'Too many feature flag requests'
    }));

    // Flag evaluation endpoints (accessible to all authenticated users)
    router.post('/evaluate', controller.evaluateFlag);
    router.post('/evaluate-bulk', controller.evaluateBulkFlags);

    // Flag management endpoints (admin only)
    router.post('/flags',
        authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN),
        controller.createFlag
    );

    router.get('/flags/:flagKey', controller.getFlag);

    router.put('/flags/:flagKey',
        authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN, UserRole.REGIONAL_ADMIN),
        controller.updateFlag
    );

    router.delete('/flags/:flagKey',
        authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN),
        controller.deleteFlag
    );

    router.get('/flags', controller.queryFlags);

    // Version management endpoints (admin only)
    router.get('/flags/:flagKey/versions', controller.getFlagVersions);
    router.post('/flags/:flagKey/rollback',
        authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN),
        controller.rollbackFlag
    );

    // Health check
    router.get('/health', controller.healthCheck);

    return router;
}

// Default export for static routes (placeholder)
const router = Router();
router.get('/', (req, res) => {
    res.json({
        message: 'Feature Flags service not initialized',
        status: 'pending_initialization'
    });
});

export default router;