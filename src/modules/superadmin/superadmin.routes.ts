import { Router } from 'express';
import { SuperAdminController } from './superadmin.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { roleMiddleware } from '../../shared/middleware/role.middleware';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import { body, param, query } from 'express-validator';

const router = Router();
const superAdminController = new SuperAdminController();

// Apply authentication and super admin role check to all routes
router.use(authMiddleware);
router.use(roleMiddleware(['SUPER_ADMIN']));

// Dashboard Routes
router.get('/dashboard', superAdminController.getDashboardData);
router.get('/system/health', superAdminController.getSystemHealth);
router.get('/system/metrics', superAdminController.getSystemMetrics);

// User Management Routes
router.get('/users',
    [
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('role').optional().isString(),
        query('status').optional().isString(),
        query('search').optional().isString()
    ],
    validateRequest,
    superAdminController.getAllUsers
);

router.post('/users',
    [
        body('email').isEmail().normalizeEmail(),
        body('firstName').isString().trim().isLength({ min: 1, max: 50 }),
        body('lastName').isString().trim().isLength({ min: 1, max: 50 }),
        body('role').isString().isIn(['ADMIN', 'COACH', 'PARENT', 'SUPPORT_STAFF', 'PARTNER_ADMIN']),
        body('password').isString().isLength({ min: 8 })
    ],
    validateRequest,
    superAdminController.createUser
);

router.put('/users/:userId',
    [
        param('userId').isMongoId(),
        body('email').optional().isEmail().normalizeEmail(),
        body('firstName').optional().isString().trim().isLength({ min: 1, max: 50 }),
        body('lastName').optional().isString().trim().isLength({ min: 1, max: 50 }),
        body('role').optional().isString(),
        body('status').optional().isString().isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
    ],
    validateRequest,
    superAdminController.updateUser
);

router.delete('/users/:userId',
    [param('userId').isMongoId()],
    validateRequest,
    superAdminController.deleteUser
);

router.post('/users/:userId/suspend',
    [
        param('userId').isMongoId(),
        body('reason').isString().trim().isLength({ min: 1, max: 500 })
    ],
    validateRequest,
    superAdminController.suspendUser
);

router.post('/users/:userId/activate',
    [param('userId').isMongoId()],
    validateRequest,
    superAdminController.activateUser
);

// Role Management Routes
router.get('/roles', superAdminController.getAllRoles);

router.post('/roles',
    [
        body('name').isString().trim().isLength({ min: 1, max: 50 }),
        body('description').isString().trim().isLength({ min: 1, max: 200 }),
        body('permissions').isArray().notEmpty()
    ],
    validateRequest,
    superAdminController.createRole
);

router.put('/roles/:roleId',
    [
        param('roleId').isString(),
        body('name').optional().isString().trim().isLength({ min: 1, max: 50 }),
        body('description').optional().isString().trim().isLength({ min: 1, max: 200 }),
        body('permissions').optional().isArray()
    ],
    validateRequest,
    superAdminController.updateRole
);

router.delete('/roles/:roleId',
    [param('roleId').isString()],
    validateRequest,
    superAdminController.deleteRole
);

// Security Routes
router.get('/security/events',
    [
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('type').optional().isString(),
        query('riskLevel').optional().isString().isIn(['low', 'medium', 'high', 'critical']),
        query('startDate').optional().isISO8601(),
        query('endDate').optional().isISO8601()
    ],
    validateRequest,
    superAdminController.getSecurityEvents
);

router.get('/security/dashboard', superAdminController.getSecurityDashboard);

// Database Routes
router.get('/database/metrics', superAdminController.getDatabaseMetrics);

router.post('/database/backup', superAdminController.createBackup);

router.post('/database/restore/:backupId',
    [param('backupId').isString()],
    validateRequest,
    superAdminController.restoreBackup
);

// System Logs Routes
router.get('/logs',
    [
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('level').optional().isString().isIn(['debug', 'info', 'warn', 'error', 'fatal']),
        query('source').optional().isString(),
        query('startDate').optional().isISO8601(),
        query('endDate').optional().isISO8601(),
        query('search').optional().isString()
    ],
    validateRequest,
    superAdminController.getSystemLogs
);

// Platform Settings Routes
router.get('/platform/settings', superAdminController.getPlatformSettings);

router.put('/platform/settings',
    [
        body('general').optional().isObject(),
        body('security').optional().isObject(),
        body('features').optional().isObject(),
        body('integrations').optional().isObject()
    ],
    validateRequest,
    superAdminController.updatePlatformSettings
);

// System Control Routes
router.post('/system/maintenance/enable',
    [body('message').optional().isString().trim().isLength({ max: 500 })],
    validateRequest,
    superAdminController.enableMaintenanceMode
);

router.post('/system/maintenance/disable', superAdminController.disableMaintenanceMode);

router.post('/system/cache/clear',
    [body('type').optional().isString()],
    validateRequest,
    superAdminController.clearCache
);

router.post('/system/services/:serviceName/restart',
    [param('serviceName').isString().trim().isLength({ min: 1, max: 50 })],
    validateRequest,
    superAdminController.restartService
);

// Analytics Routes
router.get('/analytics/global',
    [query('period').optional().isString().isIn(['24h', '7d', '30d', '90d', '1y'])],
    validateRequest,
    superAdminController.getGlobalAnalytics
);

router.get('/analytics/users',
    [query('period').optional().isString().isIn(['24h', '7d', '30d', '90d', '1y'])],
    validateRequest,
    superAdminController.getUserAnalytics
);

router.get('/analytics/performance',
    [query('period').optional().isString().isIn(['1h', '24h', '7d', '30d'])],
    validateRequest,
    superAdminController.getPerformanceAnalytics
);

// Monitoring Routes
router.get('/monitoring/alerts', superAdminController.getAlerts);

router.post('/monitoring/alerts/:alertId/acknowledge',
    [param('alertId').isString()],
    validateRequest,
    superAdminController.acknowledgeAlert
);

router.post('/monitoring/alerts/:alertId/resolve',
    [param('alertId').isString()],
    validateRequest,
    superAdminController.resolveAlert
);

export { router as superAdminRoutes };