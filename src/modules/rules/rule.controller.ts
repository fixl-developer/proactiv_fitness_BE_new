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
        const filters = this.buildRuleFilters(req.query);

        const result = await this.ruleService.findWithPagination(filters, req.query);

        ResponseUtil.success(res, result, 'Rules retrieved successfully');
    });

    /**
     * Get rule by ID
     */
    getRuleById = asyncHandler(async (req: Request, res: Response) => {
        const rule = await this.ruleService.findById(req.params.id);
        if (!rule) {
            throw new AppError('Rule not found', HTTP_STATUS.NOT_FOUND);
        }

        ResponseUtil.success(res, rule, 'Rule retrieved successfully');
    });

    /**
     * Create rule
     *
     * Admin Rules UI sends a simplified payload:
     *   { name, category, conditions:[{field,operator,value}], priority, status, description }
     * The Rule schema requires: ruleType, actions, effectiveFrom, condition.dataType.
     * We backfill safe defaults here so the UI flow works without overhauling the schema.
     */
    createRule = asyncHandler(async (req: Request, res: Response) => {
        const body = this.normalizeRulePayload(req.body);
        const rule = await this.ruleService.create({
            ...body,
            createdBy: req.user.id,
            updatedBy: req.user.id
        });

        ResponseUtil.success(res, rule, 'Rule created successfully', HTTP_STATUS.CREATED);
    });

    /**
     * Map UI category (enrollment, scheduling, age, etc.) → backend RuleType enum.
     * Falls back to BOOKING if unknown.
     */
    private mapCategoryToRuleType(category: string, explicit?: string): string {
        if (explicit) return explicit;
        const map: Record<string, string> = {
            enrollment: 'booking',
            scheduling: 'booking',
            pricing: 'pricing',
            capacity: 'capacity',
            age: 'booking',
            prerequisite: 'booking',
            booking: 'booking',
            cancellation: 'cancellation',
            sla: 'sla',
            promotion: 'promotion',
            makeup: 'makeup',
            waitlist: 'waitlist',
            attendance: 'attendance',
            refund: 'refund'
        };
        return map[(category || '').toLowerCase()] || 'booking';
    }

    /**
     * Fill defaults for the simplified UI rule payload.
     */
    private normalizeRulePayload(body: any): any {
        const conditions = Array.isArray(body.conditions) && body.conditions.length > 0
            ? body.conditions.map((c: any) => ({
                field: c.field,
                operator: c.operator,
                value: c.value,
                dataType: c.dataType || (typeof c.value === 'number' ? 'number' : 'string')
            }))
            : [{ field: 'placeholder', operator: 'equals', value: 'true', dataType: 'string' }];

        const actions = Array.isArray(body.actions) && body.actions.length > 0
            ? body.actions
            : [{
                type: 'allow',
                parameters: {},
                message: 'Default allow action',
                priority: 1
            }];

        return {
            name: body.name,
            description: body.description || body.name || 'Rule',
            ruleType: this.mapCategoryToRuleType(body.category, body.ruleType),
            category: body.category,
            conditions,
            conditionLogic: body.conditionLogic || 'AND',
            actions,
            priority: typeof body.priority === 'number' ? body.priority : 1,
            stopOnMatch: body.stopOnMatch ?? false,
            effectiveFrom: body.effectiveFrom ? new Date(body.effectiveFrom) : new Date(),
            effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : undefined,
            applicableDays: body.applicableDays || [],
            applicableTimeSlots: body.applicableTimeSlots || [],
            status: body.status || 'active',
            businessUnitId: body.businessUnitId,
            locationIds: body.locationIds || [],
            programIds: body.programIds || []
        };
    }

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
     *
     * Admin "Test All Rules" sends an empty body. Treat missing ruleType as
     * "evaluate every active rule" and synthesise a minimal context.
     */
    evaluateRules = asyncHandler(async (req: Request, res: Response) => {
        const ruleType: string | undefined = req.body?.ruleType;
        const context = {
            ...(req.body?.context || {}),
            timestamp: req.body?.context?.timestamp ? new Date(req.body.context.timestamp) : new Date(),
            userId: req.body?.context?.userId || req.user?.id
        };

        let results: any[] = [];
        if (ruleType) {
            results = await this.ruleService.evaluateRules(ruleType, context as any);
        } else {
            // No ruleType provided → evaluate every distinct ruleType that has active rules.
            // Service evaluates rules per-type, so loop through distinct types.
            const types = await this.ruleService.findAll({ status: 'active' } as any);
            const distinctTypes = Array.from(new Set((types || []).map((r: any) => r.ruleType)));
            for (const t of distinctTypes) {
                try {
                    const partial = await this.ruleService.evaluateRules(t as string, context as any);
                    results.push(...partial);
                } catch {
                    // Continue evaluating other types even if one fails
                }
            }
        }

        // Normalise shape so frontend can read {ruleId, ruleName, passed, message}
        const normalised = (results || []).map((r: any) => ({
            ruleId: r.ruleId,
            ruleName: r.ruleName,
            passed: r.matched ?? r.passed ?? false,
            message: r.message || (r.matched ? 'Rule conditions matched' : 'Rule conditions did not match')
        }));

        ResponseUtil.success(res, normalised, 'Rules evaluated successfully');
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
        const filters = this.buildPolicyFilters(req.query);

        const result = await this.policyService.findWithPagination(filters, req.query);

        ResponseUtil.success(res, result, 'Policies retrieved successfully');
    });

    /**
     * Get policy by ID
     */
    getPolicyById = asyncHandler(async (req: Request, res: Response) => {
        const policy = await this.policyService.findById(req.params.id);
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
        const policy = await this.policyService.findById(req.params.id);
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

        const result = await this.ruleTemplateService.findWithPagination(filters, req.query);

        ResponseUtil.success(res, result, 'Rule templates retrieved successfully');
    });

    /**
     * Get rule template by ID
     */
    getRuleTemplateById = asyncHandler(async (req: Request, res: Response) => {
        const template = await this.ruleTemplateService.findById(req.params.id);
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

