import { Request, Response } from 'express';
import { SuperAdminService } from './superadmin.service';
import { BaseController } from '../../shared/base/base.controller';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';

export class SuperAdminController extends BaseController {
    private superAdminService: SuperAdminService;

    constructor() {
        super();
        this.superAdminService = new SuperAdminService();
    }

    /**
     * Get super admin dashboard data
     */
    getDashboardData = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const dashboardData = await this.superAdminService.getDashboardData();

        return this.sendSuccess(res, {
            message: 'Dashboard data retrieved successfully',
            data: dashboardData
        });
    });

    /**
     * Get system health status
     */
    getSystemHealth = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const systemHealth = await this.superAdminService.getSystemHealth();

        return this.sendSuccess(res, {
            message: 'System health retrieved successfully',
            data: systemHealth
        });
    });

    /**
     * Get system metrics
     */
    getSystemMetrics = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const metrics = await this.superAdminService.getSystemMetrics();

        return this.sendSuccess(res, {
            message: 'System metrics retrieved successfully',
            data: metrics
        });
    });

    /**
     * Get all users with filtering and pagination
     */
    getAllUsers = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const {
            page = 1,
            limit = 25,
            role,
            status,
            search
        } = req.query;

        const filters = {
            role,
            status,
            search
        };

        const result = await this.superAdminService.getAllUsers(filters, Number(page), Number(limit));

        return this.sendSuccess(res, {
            message: 'Users retrieved successfully',
            data: result
        });
    });

    /**
     * Create new user
     */
    createUser = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const user = await this.superAdminService.createUser(req.body, userId);

        return this.sendSuccess(res, {
            message: 'User created successfully',
            data: user
        });
    });

    /**
     * Update user
     */
    updateUser = asyncHandler(async (req: Request, res: Response) => {
        const { userId: targetUserId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const user = await this.superAdminService.updateUser(targetUserId, req.body, userId);

        return this.sendSuccess(res, {
            message: 'User updated successfully',
            data: user
        });
    });

    /**
     * Delete user
     */
    deleteUser = asyncHandler(async (req: Request, res: Response) => {
        const { userId: targetUserId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        await this.superAdminService.deleteUser(targetUserId, userId);

        return this.sendSuccess(res, {
            message: 'User deleted successfully'
        });
    });

    /**
     * Suspend user
     */
    suspendUser = asyncHandler(async (req: Request, res: Response) => {
        const { userId: targetUserId } = req.params;
        const { reason } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        await this.superAdminService.suspendUser(targetUserId, reason, userId);

        return this.sendSuccess(res, {
            message: 'User suspended successfully'
        });
    });

    /**
     * Activate user
     */
    activateUser = asyncHandler(async (req: Request, res: Response) => {
        const { userId: targetUserId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        await this.superAdminService.activateUser(targetUserId, userId);

        return this.sendSuccess(res, {
            message: 'User activated successfully'
        });
    });

    /**
     * Get all roles
     */
    getAllRoles = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const roles = await this.superAdminService.getAllRoles();

        return this.sendSuccess(res, {
            message: 'Roles retrieved successfully',
            data: roles
        });
    });

    /**
     * Create role
     */
    createRole = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const role = await this.superAdminService.createRole(req.body, userId);

        return this.sendSuccess(res, {
            message: 'Role created successfully',
            data: role
        });
    });

    /**
     * Update role
     */
    updateRole = asyncHandler(async (req: Request, res: Response) => {
        const { roleId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const role = await this.superAdminService.updateRole(roleId, req.body, userId);

        return this.sendSuccess(res, {
            message: 'Role updated successfully',
            data: role
        });
    });

    /**
     * Delete role
     */
    deleteRole = asyncHandler(async (req: Request, res: Response) => {
        const { roleId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        await this.superAdminService.deleteRole(roleId, userId);

        return this.sendSuccess(res, {
            message: 'Role deleted successfully'
        });
    });

    /**
     * Get security events
     */
    getSecurityEvents = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const {
            page = 1,
            limit = 25,
            type,
            riskLevel,
            startDate,
            endDate
        } = req.query;

        const filters = {
            type,
            riskLevel,
            startDate,
            endDate
        };

        const result = await this.superAdminService.getSecurityEvents(filters, Number(page), Number(limit));

        return this.sendSuccess(res, {
            message: 'Security events retrieved successfully',
            data: result
        });
    });

    /**
     * Get security dashboard
     */
    getSecurityDashboard = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const dashboard = await this.superAdminService.getSecurityDashboard();

        return this.sendSuccess(res, {
            message: 'Security dashboard retrieved successfully',
            data: dashboard
        });
    });

    /**
     * Get database metrics
     */
    getDatabaseMetrics = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const metrics = await this.superAdminService.getDatabaseMetrics();

        return this.sendSuccess(res, {
            message: 'Database metrics retrieved successfully',
            data: metrics
        });
    });

    /**
     * Create database backup
     */
    createBackup = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const backup = await this.superAdminService.createBackup(userId);

        return this.sendSuccess(res, {
            message: 'Backup created successfully',
            data: backup
        });
    });

    /**
     * Restore database backup
     */
    restoreBackup = asyncHandler(async (req: Request, res: Response) => {
        const { backupId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const result = await this.superAdminService.restoreBackup(backupId, userId);

        return this.sendSuccess(res, {
            message: 'Backup restored successfully',
            data: result
        });
    });

    /**
     * Get system logs
     */
    getSystemLogs = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const {
            page = 1,
            limit = 25,
            level,
            source,
            startDate,
            endDate,
            search
        } = req.query;

        const filters = {
            level,
            source,
            startDate,
            endDate,
            search
        };

        const result = await this.superAdminService.getSystemLogs(filters, Number(page), Number(limit));

        return this.sendSuccess(res, {
            message: 'System logs retrieved successfully',
            data: result
        });
    });

    /**
     * Get platform settings
     */
    getPlatformSettings = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const settings = await this.superAdminService.getPlatformSettings();

        return this.sendSuccess(res, {
            message: 'Platform settings retrieved successfully',
            data: settings
        });
    });

    /**
     * Update platform settings
     */
    updatePlatformSettings = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const settings = await this.superAdminService.updatePlatformSettings(req.body, userId);

        return this.sendSuccess(res, {
            message: 'Platform settings updated successfully',
            data: settings
        });
    });

    /**
     * Enable maintenance mode
     */
    enableMaintenanceMode = asyncHandler(async (req: Request, res: Response) => {
        const { message } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        await this.superAdminService.enableMaintenanceMode(message, userId);

        return this.sendSuccess(res, {
            message: 'Maintenance mode enabled successfully'
        });
    });

    /**
     * Disable maintenance mode
     */
    disableMaintenanceMode = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        await this.superAdminService.disableMaintenanceMode(userId);

        return this.sendSuccess(res, {
            message: 'Maintenance mode disabled successfully'
        });
    });

    /**
     * Clear cache
     */
    clearCache = asyncHandler(async (req: Request, res: Response) => {
        const { type } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        await this.superAdminService.clearCache(type, userId);

        return this.sendSuccess(res, {
            message: 'Cache cleared successfully'
        });
    });

    /**
     * Restart service
     */
    restartService = asyncHandler(async (req: Request, res: Response) => {
        const { serviceName } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        await this.superAdminService.restartService(serviceName, userId);

        return this.sendSuccess(res, {
            message: `Service ${serviceName} restarted successfully`
        });
    });

    /**
     * Get global analytics
     */
    getGlobalAnalytics = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const { period = '30d' } = req.query;

        const analytics = await this.superAdminService.getGlobalAnalytics(period as string);

        return this.sendSuccess(res, {
            message: 'Global analytics retrieved successfully',
            data: analytics
        });
    });

    /**
     * Get user analytics
     */
    getUserAnalytics = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const { period = '30d' } = req.query;

        const analytics = await this.superAdminService.getUserAnalytics(period as string);

        return this.sendSuccess(res, {
            message: 'User analytics retrieved successfully',
            data: analytics
        });
    });

    /**
     * Get performance analytics
     */
    getPerformanceAnalytics = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const { period = '24h' } = req.query;

        const analytics = await this.superAdminService.getPerformanceAnalytics(period as string);

        return this.sendSuccess(res, {
            message: 'Performance analytics retrieved successfully',
            data: analytics
        });
    });

    /**
     * Get monitoring alerts
     */
    getAlerts = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const alerts = await this.superAdminService.getAlerts();

        return this.sendSuccess(res, {
            message: 'Alerts retrieved successfully',
            data: alerts
        });
    });

    /**
     * Acknowledge alert
     */
    acknowledgeAlert = asyncHandler(async (req: Request, res: Response) => {
        const { alertId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        await this.superAdminService.acknowledgeAlert(alertId, userId);

        return this.sendSuccess(res, {
            message: 'Alert acknowledged successfully'
        });
    });

    /**
     * Resolve alert
     */
    resolveAlert = asyncHandler(async (req: Request, res: Response) => {
        const { alertId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        await this.superAdminService.resolveAlert(alertId, userId);

        return this.sendSuccess(res, {
            message: 'Alert resolved successfully'
        });
    });
}
