import { Request, Response } from 'express';
import { AutomationService } from './automation.service';
import { WorkflowExecution, WorkflowTemplate, AutomationRule } from './automation.model';
import { BaseController } from '../../shared/base/base.controller';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';
import { successResponse } from '../../shared/utils/response.util';
import { PaginationUtil } from '../../shared/utils/pagination.util';

export class AutomationController extends BaseController {
    private automationService: AutomationService;

    constructor() {
        super();
        this.automationService = new AutomationService();
    }

    /**
     * Create workflow
     */
    createWorkflow = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const workflow = await this.automationService.createWorkflow(req.body, userId);

        return successResponse(res, {
            message: 'Workflow created successfully',
            data: workflow
        }, HTTP_STATUS.CREATED);
    });

    /**
     * Get all workflows
     */
    getWorkflows = asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 10,
            status,
            businessUnitId,
            locationId,
            tags,
            isActive,
            searchText
        } = req.query;

        const filter: any = {};

        if (status) filter.status = status;
        if (businessUnitId) filter.businessUnitId = businessUnitId;
        if (locationId) filter.locationIds = { $in: [locationId] };
        if (tags) filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (searchText) {
            filter.$or = [
                { name: { $regex: searchText, $options: 'i' } },
                { description: { $regex: searchText, $options: 'i' } }
            ];
        }

        const workflows = await this.automationService.findWithPagination(
            filter,
            {
                page: Number(page),
                limit: Number(limit),
                sort: { createdAt: -1 }
            }
        );

        return successResponse(res, {
            message: 'Workflows retrieved successfully',
            data: workflows
        });
    });

    /**
     * Get workflow by ID
     */
    getWorkflowById = asyncHandler(async (req: Request, res: Response) => {
        const { workflowId } = req.params;

        const workflow = await this.automationService.findOne({ workflowId });
        if (!workflow) {
            throw new AppError('Workflow not found', HTTP_STATUS.NOT_FOUND);
        }

        return successResponse(res, {
            message: 'Workflow retrieved successfully',
            data: workflow
        });
    });

    /**
     * Update workflow
     */
    updateWorkflow = asyncHandler(async (req: Request, res: Response) => {
        const { workflowId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const workflow = await this.automationService.findOneAndUpdate(
            { workflowId },
            { ...req.body, updatedBy: userId },
            { new: true }
        );

        if (!workflow) {
            throw new AppError('Workflow not found', HTTP_STATUS.NOT_FOUND);
        }

        return successResponse(res, {
            message: 'Workflow updated successfully',
            data: workflow
        });
    });

    /**
     * Delete workflow
     */
    deleteWorkflow = asyncHandler(async (req: Request, res: Response) => {
        const { workflowId } = req.params;

        const workflow = await this.automationService.findOneAndDelete({ workflowId });
        if (!workflow) {
            throw new AppError('Workflow not found', HTTP_STATUS.NOT_FOUND);
        }

        return successResponse(res, {
            message: 'Workflow deleted successfully'
        });
    });

    /**
     * Execute workflow
     */
    executeWorkflow = asyncHandler(async (req: Request, res: Response) => {
        const { workflowId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const execution = await this.automationService.executeWorkflow(
            {
                workflowId,
                ...req.body
            },
            userId
        );

        return successResponse(res, {
            message: 'Workflow execution started',
            data: execution
        }, HTTP_STATUS.ACCEPTED);
    });

    /**
     * Update workflow status
     */
    updateWorkflowStatus = asyncHandler(async (req: Request, res: Response) => {
        const { workflowId } = req.params;
        const { status } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const workflow = await this.automationService.updateWorkflowStatus(workflowId, status, userId);

        return successResponse(res, {
            message: 'Workflow status updated successfully',
            data: workflow
        });
    });

    /**
     * Get workflow executions
     */
    getWorkflowExecutions = asyncHandler(async (req: Request, res: Response) => {
        const { workflowId } = req.params;
        const {
            page = 1,
            limit = 10,
            status,
            triggeredBy,
            startDate,
            endDate
        } = req.query;

        const filter: any = { workflowId };

        if (status) filter.status = status;
        if (triggeredBy) filter.triggeredBy = triggeredBy;
        if (startDate || endDate) {
            filter.startedAt = {};
            if (startDate) filter.startedAt.$gte = new Date(startDate as string);
            if (endDate) filter.startedAt.$lte = new Date(endDate as string);
        }

        const { page: pageNum, limit: limitNum, skip } = PaginationUtil.getPaginationParams({
            page: Number(page),
            limit: Number(limit)
        });

        const [data, total] = await Promise.all([
            WorkflowExecution.find({ ...filter, isDeleted: { $ne: true } })
                .sort({ startedAt: -1 })
                .skip(skip)
                .limit(limitNum),
            WorkflowExecution.countDocuments({ ...filter, isDeleted: { $ne: true } })
        ]);

        const result = PaginationUtil.buildPaginationResult(data, total, pageNum, limitNum);

        return successResponse(res, {
            message: 'Workflow executions retrieved successfully',
            data: result
        });
    });

    /**
     * Get workflow statistics
     */
    getWorkflowStatistics = asyncHandler(async (req: Request, res: Response) => {
        const { businessUnitId } = req.query;

        const statistics = await this.automationService.getWorkflowStatistics(
            businessUnitId as string
        );

        return successResponse(res, {
            message: 'Workflow statistics retrieved successfully',
            data: statistics
        });
    });

    /**
     * Create automation rule
     */
    createAutomationRule = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const rule = await this.automationService.createAutomationRule(req.body, userId);

        return successResponse(res, {
            message: 'Automation rule created successfully',
            data: rule
        }, HTTP_STATUS.CREATED);
    });

    /**
     * Create workflow template
     */
    createWorkflowTemplate = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const template = await this.automationService.createWorkflowTemplate(req.body, userId);

        return successResponse(res, {
            message: 'Workflow template created successfully',
            data: template
        }, HTTP_STATUS.CREATED);
    });

    /**
     * Simulate workflow execution
     */
    simulateWorkflow = asyncHandler(async (req: Request, res: Response) => {
        const { workflowId } = req.params;
        const { simulationData } = req.body;

        // Implementation for workflow simulation
        // This would run the workflow in simulation mode without actual execution

        return successResponse(res, {
            message: 'Workflow simulation completed',
            data: {
                simulationId: `sim_${Date.now()}`,
                workflowId,
                results: {
                    stepResults: [],
                    finalResult: null,
                    executionTime: 0,
                    success: true
                },
                createdAt: new Date()
            }
        });
    });

    /**
     * Get workflow templates
     */
    getWorkflowTemplates = asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 10,
            category,
            isPublic
        } = req.query;

        const filter: any = {};

        if (category) filter.category = category;
        if (isPublic !== undefined) filter.isPublic = isPublic === 'true';

        const { page: pageNum, limit: limitNum, skip } = PaginationUtil.getPaginationParams({
            page: Number(page),
            limit: Number(limit)
        });

        const [data, total] = await Promise.all([
            WorkflowTemplate.find({ ...filter, isDeleted: { $ne: true } })
                .sort({ usageCount: -1, createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            WorkflowTemplate.countDocuments({ ...filter, isDeleted: { $ne: true } })
        ]);

        const result = PaginationUtil.buildPaginationResult(data, total, pageNum, limitNum);

        return successResponse(res, {
            message: 'Workflow templates retrieved successfully',
            data: result
        });
    });

    /**
     * Get automation rules
     */
    getAutomationRules = asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 10,
            businessUnitId,
            isActive
        } = req.query;

        const filter: any = {};

        if (businessUnitId) filter.businessUnitId = businessUnitId;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const { page: pageNum, limit: limitNum, skip } = PaginationUtil.getPaginationParams({
            page: Number(page),
            limit: Number(limit)
        });

        const [data, total] = await Promise.all([
            AutomationRule.find({ ...filter, isDeleted: { $ne: true } })
                .sort({ priority: -1, createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            AutomationRule.countDocuments({ ...filter, isDeleted: { $ne: true } })
        ]);

        const result = PaginationUtil.buildPaginationResult(data, total, pageNum, limitNum);

        return successResponse(res, {
            message: 'Automation rules retrieved successfully',
            data: result
        });
    });
}