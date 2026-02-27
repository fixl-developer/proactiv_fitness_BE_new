import { Request, Response } from 'express';
import { RuleService, PolicyService, RuleTemplateService } from './rule.service';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';
import { ResponseUtil } from '../../shared/utils/response.util';
import { PaginationUtil } from '../../shared/utils/pagination.util';

export class RuleController {
    private ruleService: RuleService;

    constructor() {
        this.ruleService = new RuleService();
    }

    /**
     * Get all rules
     */
    getRules = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit, skip } = PaginationUtil.getPaginationParams(req.query);
        const filters = this.buildRuleFilters(req.query);

        const { data, total } = await this.ruleService.getAll(filters, {
            page,
            limit,
            skip,
            sort: { priority: -1, createdAt: -1 }
        });

        const meta = PaginationUtil.buildMeta(total, page, limit);

        ResponseUtil.success(res, data, 'Rules retrieved successfully', HTTP_STATUS.OK, meta);
    });

    /**
     * Get rule by ID
     */
    getRuleById = asyncHandler(async (req: Request, res: Response) => {
        const rule = await this.ruleService.getById(req.params.id);
        if (!rule) {
            throw new AppError('Rule not found', HTTP_STATUS.NOT_FOUND);
        }

        ResponseUtil.success(res, rule, 'Rule retrieved successfully');
    });

    /**
     * Create rule
     */
    createRule = asyncHandler(async (req: Request, res: Response) => {
        const rule = await this.ruleService.create({
            ...req.body,
            createdBy: req.user.id,
            updatedBy: req.user.id
        });

        ResponseUtil.success(res, rule, 'Rule created successfully', HTTP_STATUS.CREATED);
    });

    /**
     * Update rule
     */
    updateRule = asyncHandler(async (req: Request, res: Response) => {
        const rule = await this.ruleService.update(
            req.params.id,
            { ...req.body, updatedBy: req.user.id }
        );

        ResponseUtil.success(res, rule, 'Rule updated successfully');
    });

    /**
     * Delete rule
     */
    deleteRule = asyncHandler(async (req: Request, res: Response) => {
        await this.ruleService.delete(req.params.id);
        ResponseUtil.success(res, null, 'Rule deleted successfully');
    });

    /**
     * Toggle rule status
     */
    toggleRuleStatus = asyncHandler(async (req: Request, res: Response) => {
        const { status } = req.body;
        const rule = await this.ruleService.toggleRuleStatus(
            req.params.id,
            status,
            req.user.id
        );

        ResponseUtil.success(res, rule, 'Rule status updated successfully');
    });

    /**
     * Evaluate rules
     */
    evaluateRules = asyncHandler(async (req: Request, res: Response) => {
        const { ruleType, context } = req.body;

        const results = await this.ruleService.evaluateRules(ruleType, context);

        ResponseUtil.success(res, results, 'Rules evaluated successfully');
    });

    /**
     * Get rule statistics
     */
    getRuleStatistics = asyncHandler(async (req: Request, res: Response) => {
        const statistics = await this.ruleService.getRuleStatistics(req.params.id);
        ResponseUtil.success(res, statistics, 'Rule statistics retrieved successfully');
    });

    /**
     * Create rule from template
     */
    createRuleFromTemplate = asyncHandler(async (req: Request, res: Response) => {
        const rule = await this.ruleService.createRuleFromTemplate(
            req.params.templateId,
            req.body,
            req.user.id
        );

        ResponseUtil.success(res, rule, 'Rule created from template successfully', HTTP_STATUS.CREATED);
    });

    private buildRuleFilters(query: any) {
        const filters: any = {};

        if (query.ruleType) filters.ruleType = query.ruleType;
        if (query.category) filters.category = query.category;
        if (query.status) filters.status = query.status;
        if (query.businessUnitId) filters.businessUnitId = query.businessUnitId;
        if (query.locationId) filters.locationIds = query.locationId;
        if (query.programId) filters.programIds = query.programId;

        if (query.effectiveDate) {
            const effectiveDate = new Date(query.effectiveDate);
            filters.effectiveFrom = { $lte: effectiveDate };
            filters.$or = [
                { effectiveTo: { $exists: false } },
                { effectiveTo: { $gte: effectiveDate } }
            ];
        }

        if (query.searchText) {
            filters.$text = { $search: query.searchText };
        }

        return filters;
    }
}

export class PolicyController {
    private policyService: PolicyService;
    private ruleService: RuleService;

    constructor() {
        this.policyService = new PolicyService();
        this.ruleService = new RuleService();
    }

    /**
     * Get all policies
     */
    getPolicies = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit, skip } = PaginationUtil.getPaginationParams(req.query);
        const filters = this.buildPolicyFilters(req.query);

        const { data, total } = await this.policyService.getAll(filters, {
            page,
            limit,
            skip,
            sort: { createdAt: -1 }
        });

        const meta = PaginationUtil.buildMeta(total, page, limit);

        ResponseUtil.success(res, data, 'Policies retrieved successfully', HTTP_STATUS.OK, meta);
    });

    /**
     * Get policy by ID
     */
    getPolicyById = asyncHandler(async (req: Request, res: Response) => {
        const policy = await this.policyService.getById(req.params.id);
        if (!policy) {
            throw new AppError('Policy not found', HTTP_STATUS.NOT_FOUND);
        }

        ResponseUtil.success(res, policy, 'Policy retrieved successfully');
    });

    /**
     * Create policy
     */
    createPolicy = asyncHandler(async (req: Request, res: Response) => {
        const policy = await this.policyService.create({
            ...req.body,
            createdBy: req.user.id,
            updatedBy: req.user.id
        });

        ResponseUtil.success(res, policy, 'Policy created successfully', HTTP_STATUS.CREATED);
    });

    /**
     * Update policy
     */
    updatePolicy = asyncHandler(async (req: Request, res: Response) => {
        const policy = await this.policyService.update(
            req.params.id,
            { ...req.body, updatedBy: req.user.id }
        );

        ResponseUtil.success(res, policy, 'Policy updated successfully');
    });

    /**
     * Delete policy
     */
    deletePolicy = asyncHandler(async (req: Request, res: Response) => {
        await this.policyService.delete(req.params.id);
        ResponseUtil.success(res, null, 'Policy deleted successfully');
    });

    /**
     * Evaluate policy
     */
    evaluatePolicy = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.ruleService.evaluatePolicy(
            req.params.id,
            req.body
        );

        ResponseUtil.success(res, result, 'Policy evaluated successfully');
    });

    /**
     * Get policy statistics
     */
    getPolicyStatistics = asyncHandler(async (req: Request, res: Response) => {
        const policy = await this.policyService.getById(req.params.id);
        if (!policy) {
            throw new AppError('Policy not found', HTTP_STATUS.NOT_FOUND);
        }

        ResponseUtil.success(res, policy.statistics, 'Policy statistics retrieved successfully');
    });

    private buildPolicyFilters(query: any) {
        const filters: any = {};

        if (query.policyType) filters.policyType = query.policyType;
        if (query.status) filters.status = query.status;
        if (query.businessUnitId) filters.businessUnitId = query.businessUnitId;
        if (query.locationId) filters.locationIds = query.locationId;
        if (query.programId) filters.programIds = query.programId;

        if (query.effectiveDate) {
            const effectiveDate = new Date(query.effectiveDate);
            filters.effectiveFrom = { $lte: effectiveDate };
            filters.$or = [
                { effectiveTo: { $exists: false } },
                { effectiveTo: { $gte: effectiveDate } }
            ];
        }

        if (query.searchText) {
            filters.$text = { $search: query.searchText };
        }

        return filters;
    }
}

export class RuleTemplateController {
    private ruleTemplateService: RuleTemplateService;

    constructor() {
        this.ruleTemplateService = new RuleTemplateService();
    }

    /**
     * Get all rule templates
     */
    getRuleTemplates = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit, skip } = PaginationUtil.getPaginationParams(req.query);
        const filters = this.buildTemplateFilters(req.query);

        const { data, total } = await this.ruleTemplateService.getAll(filters, {
            page,
            limit,
            skip,
            sort: { usageCount: -1, createdAt: -1 }
        });

        const meta = PaginationUtil.buildMeta(total, page, limit);

        ResponseUtil.success(res, data, 'Rule templates retrieved successfully', HTTP_STATUS.OK, meta);
    });

    /**
     * Get rule template by ID
     */
    getRuleTemplateById = asyncHandler(async (req: Request, res: Response) => {
        const template = await this.ruleTemplateService.getById(req.params.id);
        if (!template) {
            throw new AppError('Rule template not found', HTTP_STATUS.NOT_FOUND);
        }

        ResponseUtil.success(res, template, 'Rule template retrieved successfully');
    });

    /**
     * Create rule template
     */
    createRuleTemplate = asyncHandler(async (req: Request, res: Response) => {
        const template = await this.ruleTemplateService.create({
            ...req.body,
            createdBy: req.user.id
        });

        ResponseUtil.success(res, template, 'Rule template created successfully', HTTP_STATUS.CREATED);
    });

    private buildTemplateFilters(query: any) {
        const filters: any = {};

        if (query.ruleType) filters.ruleType = query.ruleType;
        if (query.category) filters.category = query.category;
        if (query.isPublic !== undefined) filters.isPublic = query.isPublic === 'true';

        if (query.searchText) {
            filters.$text = { $search: query.searchText };
        }

        return filters;
    }
}