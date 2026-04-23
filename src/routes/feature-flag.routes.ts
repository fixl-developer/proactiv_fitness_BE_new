import { Router } from 'express';
import { FeatureFlagsController } from '../controllers/feature-flags.controller';
import { authenticate, authorize } from '../modules/iam/auth.middleware';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';
import { UserRole } from '../shared/enums';

// Note: This route will be initialized with service instances in app.ts
export function createFeatureFlagRoutes(controller: FeatureFlagsController): Router {
    const router = Router();

    // Apply authentication to all routes
    // Feature flags routes placeholder;

    // Apply rate limiting
    // Feature flags routes placeholder);

    // Flag evaluation endpoints (accessible to all authenticated users)
    router.post('/evaluate', controller.evaluateFlag);
    router.post('/evaluate-bulk', controller.evaluateBulkFlags);

    // Flag management endpoints (admin only)
    router.post('/flags',
        authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
        controller.createFlag
    );

    router.get('/flags/:flagKey', controller.getFlag);

    router.put('/flags/:flagKey',
        authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
        controller.updateFlag
    );

    router.delete('/flags/:flagKey',
        authorize(UserRole.ADMIN),
        controller.deleteFlag
    );

    router.get('/flags', controller.queryFlags);

    // Version management endpoints (admin only)
    router.get('/flags/:flagKey/versions', controller.getFlagVersions);
    router.post('/flags/:flagKey/rollback',
        authorize(UserRole.ADMIN),
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