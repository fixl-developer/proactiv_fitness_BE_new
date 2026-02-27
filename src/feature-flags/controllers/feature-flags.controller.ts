/**
 * Feature Flags Controller
 * 
 * REST API endpoints for feature flag evaluation and management.
 */

import { Request, Response } from 'express';
import { EvaluationEngine } from '../services/evaluation-engine.service';
import { FlagManagementService } from '../services/flag-management.service';
import {
    EvaluationContext,
    CreateFlagRequest,
    UpdateFlagRequest,
    FlagQueryFilters,
    HierarchyLevel,
    Environment
} from '../interfaces';
import { AppError } from '../../shared/utils/app-error.util';
import { Logger } from '../../shared/utils/logger.util';
import { ResponseUtil } from '../../shared/utils/response.util';
import { asyncHandler } from '../../shared/utils/async-handler.util';

export class FeatureFlagsController {
    private logger = Logger.getInstance();

    constructor(
        private evaluationEngine: EvaluationEngine,
        private managementService: FlagManagementService
    ) { }

    /**
     * Evaluate a single feature flag
     * POST /api/flags/evaluate
     */
    evaluateFlag = asyncHandler(async (req: Request, res: Response) => {
        const { flagKey, context } = req.body;

        if (!flagKey || !context) {
            throw new AppError('flagKey and context are required', 400);
        }

        const evaluationContext: EvaluationContext = {
            tenantId: context.tenantId,
            userId: context.userId,
            environment: context.environment || Environment.PRODUCTION,
            hierarchyLevel: context.hierarchyLevel,
            customAttributes: context.customAttributes
        };

        const evaluation = await this.evaluationEngine.evaluateFlag(flagKey, evaluationContext);

        ResponseUtil.success(res, evaluation, 'Flag evaluated successfully');
    });

    /**
     * Evaluate multiple feature flags in bulk
     * POST /api/flags/evaluate-bulk
     */
    evaluateBulkFlags = asyncHandler(async (req: Request, res: Response) => {
        const { flagKeys, context } = req.body;

        if (!flagKeys || !Array.isArray(flagKeys) || !context) {
            throw new AppError('flagKeys (array) and context are required', 400);
        }

        const evaluationContext: EvaluationContext = {
            tenantId: context.tenantId,
            userId: context.userId,
            environment: context.environment || Environment.PRODUCTION,
            hierarchyLevel: context.hierarchyLevel,
            customAttributes: context.customAttributes
        };

        const evaluations = await this.evaluationEngine.evaluateFlags(flagKeys, evaluationContext);

        // Convert Map to object for JSON response
        const result = Object.fromEntries(evaluations);

        ResponseUtil.success(res, result, 'Flags evaluated successfully');
    });

    /**
     * Create a new feature flag
     * POST /api/flags
     */
    createFlag = asyncHandler(async (req: Request, res: Response) => {
        const flagData: CreateFlagRequest = req.body;
        const author = req.user?.id || 'system';

        if (!flagData.flagKey || !flagData.tenantId || !flagData.hierarchyLevel || !flagData.environment) {
            throw new AppError('flagKey, tenantId, hierarchyLevel, and environment are required', 400);
        }

        const flag = await this.managementService.createFlag(flagData, author);

        ResponseUtil.success(res, flag, 'Feature flag created successfully', 201);
    });

    /**
     * Get a specific feature flag
     * GET /api/flags/:flagKey
     */
    getFlag = asyncHandler(async (req: Request, res: Response) => {
        const { flagKey } = req.params;
        const { tenantId, hierarchyLevel, environment } = req.query;

        if (!tenantId || !hierarchyLevel || !environment) {
            throw new AppError('tenantId, hierarchyLevel, and environment query parameters are required', 400);
        }

        const flag = await this.managementService.getFlag(
            flagKey,
            tenantId as string,
            hierarchyLevel as HierarchyLevel,
            environment as Environment
        );

        if (!flag) {
            throw new AppError('Feature flag not found', 404);
        }

        ResponseUtil.success(res, flag, 'Feature flag retrieved successfully');
    });

    /**
     * Update a feature flag
     * PUT /api/flags/:flagKey
     */
    updateFlag = asyncHandler(async (req: Request, res: Response) => {
        const { flagKey } = req.params;
        const { tenantId, hierarchyLevel, environment } = req.query;
        const updates: UpdateFlagRequest = req.body;
        const author = req.user?.id || 'system';

        if (!tenantId || !hierarchyLevel || !environment) {
            throw new AppError('tenantId, hierarchyLevel, and environment query parameters are required', 400);
        }

        const flag = await this.managementService.updateFlag(
            flagKey,
            tenantId as string,
            hierarchyLevel as HierarchyLevel,
            environment as Environment,
            updates,
            author
        );

        // Invalidate cache for this flag
        this.evaluationEngine.invalidateCache(flagKey);

        ResponseUtil.success(res, flag, 'Feature flag updated successfully');
    });

    /**
     * Delete a feature flag
     * DELETE /api/flags/:flagKey
     */
    deleteFlag = asyncHandler(async (req: Request, res: Response) => {
        const { flagKey } = req.params;
        const { tenantId, hierarchyLevel, environment } = req.query;
        const author = req.user?.id || 'system';

        if (!tenantId || !hierarchyLevel || !environment) {
            throw new AppError('tenantId, hierarchyLevel, and environment query parameters are required', 400);
        }

        await this.managementService.deleteFlag(
            flagKey,
            tenantId as string,
            hierarchyLevel as HierarchyLevel,
            environment as Environment,
            author
        );

        // Invalidate cache for this flag
        this.evaluationEngine.invalidateCache(flagKey);

        ResponseUtil.success(res, null, 'Feature flag deleted successfully');
    });

    /**
     * Query feature flags with filters
     * GET /api/flags
     */
    queryFlags = asyncHandler(async (req: Request, res: Response) => {
        const filters: FlagQueryFilters = {
            tenantId: req.query.tenantId as string,
            hierarchyLevel: req.query.hierarchyLevel as HierarchyLevel,
            environment: req.query.environment as Environment,
            tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
            createdBy: req.query.createdBy as string,
            updatedAfter: req.query.updatedAfter ? new Date(req.query.updatedAfter as string) : undefined,
            updatedBefore: req.query.updatedBefore ? new Date(req.query.updatedBefore as string) : undefined
        };

        const limit = parseInt(req.query.limit as string) || 100;
        const offset = parseInt(req.query.offset as string) || 0;

        const flags = await this.managementService.queryFlags(filters, limit, offset);

        ResponseUtil.success(res, {
            flags,
            pagination: {
                limit,
                offset,
                total: flags.length
            }
        }, 'Feature flags retrieved successfully');
    });

    /**
     * Get version history for a flag
     * GET /api/flags/:flagKey/versions
     */
    getFlagVersions = asyncHandler(async (req: Request, res: Response) => {
        const { flagKey } = req.params;
        const { tenantId, hierarchyLevel, environment } = req.query;

        if (!tenantId || !hierarchyLevel || !environment) {
            throw new AppError('tenantId, hierarchyLevel, and environment query parameters are required', 400);
        }

        const versions = this.managementService.getVersionHistory(
            flagKey,
            tenantId as string,
            hierarchyLevel as HierarchyLevel,
            environment as Environment
        );

        ResponseUtil.success(res, versions, 'Flag version history retrieved successfully');
    });

    /**
     * Rollback flag to a previous version
     * POST /api/flags/:flagKey/rollback
     */
    rollbackFlag = asyncHandler(async (req: Request, res: Response) => {
        const { flagKey } = req.params;
        const { tenantId, hierarchyLevel, environment } = req.query;
        const { versionId } = req.body;
        const author = req.user?.id || 'system';

        if (!tenantId || !hierarchyLevel || !environment) {
            throw new AppError('tenantId, hierarchyLevel, and environment query parameters are required', 400);
        }

        if (!versionId) {
            throw new AppError('versionId is required', 400);
        }

        const flag = await this.managementService.rollbackFlag(
            flagKey,
            tenantId as string,
            hierarchyLevel as HierarchyLevel,
            environment as Environment,
            versionId,
            author
        );

        // Invalidate cache for this flag
        this.evaluationEngine.invalidateCache(flagKey);

        ResponseUtil.success(res, flag, 'Feature flag rolled back successfully');
    });

    /**
     * Health check endpoint
     * GET /api/flags/health
     */
    healthCheck = asyncHandler(async (req: Request, res: Response) => {
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'feature-flags',
            version: '1.0.0'
        };

        ResponseUtil.success(res, health, 'Service is healthy');
    });
}