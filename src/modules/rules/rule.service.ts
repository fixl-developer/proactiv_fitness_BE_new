import { FilterQuery } from 'mongoose';
import { Rule, Policy, RuleTemplate } from './rule.model';
import {
    IRule,
    IPolicy,
    IRuleTemplate,
    IRuleFilter,
    IPolicyFilter,
    IRuleContext,
    IRuleEvaluationResult,
    IPolicyEvaluationResult,
    RuleStatus,
    ConditionOperator,
    ActionType
} from './rule.interface';
import { BaseService } from '../../shared/base/base.service';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';

export class RuleService extends BaseService<IRule> {
    constructor() {
        super(Rule);
    }

    /**
     * Evaluate rules for given context
     */
    async evaluateRules(
        ruleType: string,
        context: IRuleContext
    ): Promise<IRuleEvaluationResult[]> {
        try {
            // Get applicable rules
            const rules = await this.getApplicableRules(ruleType, context);
            const results: IRuleEvaluationResult[] = [];

            for (const rule of rules) {
                const result = await this.evaluateRule(rule, context);
                results.push(result);

                // Stop if rule matches and stopOnMatch is true
                if (result.matched && rule.stopOnMatch) {
                    break;
                }
            }

            return results;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to evaluate rules',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Evaluate policy
     */
    async evaluatePolicy(
        policyId: string,
        context: IRuleContext
    ): Promise<IPolicyEvaluationResult> {
        try {
            const policy = await Policy.findById(policyId).populate('ruleIds');
            if (!policy) {
                throw new AppError('Policy not found', HTTP_STATUS.NOT_FOUND);
            }

            if (!policy.isEffective(context.timestamp)) {
                throw new AppError('Policy is not effective', HTTP_STATUS.BAD_REQUEST);
            }

            // Update policy statistics
            await this.updatePolicyStatistics(policyId);

            // Evaluate all rules in policy
            const ruleResults: IRuleEvaluationResult[] = [];
            const actions: any[] = [];
            const messages: string[] = [];
            let fees = 0;
            let discounts = 0;
            let requiresApproval = false;
            let approvalReason = '';

            // Sort rules by evaluation order
            const sortedRules = this.sortRulesByOrder(policy.ruleIds as IRule[], policy.ruleEvaluationOrder);

            for (const rule of sortedRules) {
                const result = await this.evaluateRule(rule, context);
                ruleResults.push(result);

                if (result.matched) {
                    actions.push(...result.actions);

                    // Process actions
                    for (const action of result.actions) {
                        if (action.message) {
                            messages.push(action.message);
                        }

                        switch (action.type) {
                            case ActionType.APPLY_FEE:
                                fees += action.parameters.amount || 0;
                                break;
                            case ActionType.APPLY_DISCOUNT:
                                discounts += action.parameters.amount || 0;
                                break;
                            case ActionType.REQUIRE_APPROVAL:
                                requiresApproval = true;
                                approvalReason = action.message || 'Approval required';
                                break;
                        }
                    }

                    // Stop if rule matches and stopOnMatch is true
                    if (rule.stopOnMatch) {
                        break;
                    }
                }
            }

            // Determine if action is allowed
            const allowed = !ruleResults.some(r =>
                r.matched && r.actions.some(a => a.type === ActionType.DENY)
            );

            return {
                allowed,
                actions,
                matchedRules: ruleResults.filter(r => r.matched),
                messages,
                fees,
                discounts,
                requiresApproval,
                approvalReason: requiresApproval ? approvalReason : undefined
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to evaluate policy',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Create rule from template
     */
    async createRuleFromTemplate(
        templateId: string,
        ruleData: Partial<IRule>,
        createdBy: string
    ): Promise<IRule> {
        try {
            const template = await RuleTemplate.findById(templateId);
            if (!template) {
                throw new AppError('Rule template not found', HTTP_STATUS.NOT_FOUND);
            }

            // Build rule from template
            const rule = new Rule({
                ...ruleData,
                ruleType: template.ruleType,
                category: template.category,
                conditions: this.buildConditionsFromTemplate(template, ruleData),
                actions: this.buildActionsFromTemplate(template, ruleData),
                createdBy,
                updatedBy: createdBy
            });

            await rule.save();

            // Update template usage count
            template.usageCount += 1;
            await template.save();

            return rule;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create rule from template',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get rule statistics
     */
    async getRuleStatistics(ruleId: string): Promise<any> {
        try {
            const rule = await this.getById(ruleId);
            if (!rule) {
                throw new AppError('Rule not found', HTTP_STATUS.NOT_FOUND);
            }

            const matchRate = rule.statistics.timesEvaluated > 0
                ? (rule.statistics.timesMatched / rule.statistics.timesEvaluated) * 100
                : 0;

            return {
                ...rule.statistics,
                matchRate: Math.round(matchRate * 100) / 100
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get rule statistics',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Toggle rule status
     */
    async toggleRuleStatus(ruleId: string, status: RuleStatus, updatedBy: string): Promise<IRule> {
        try {
            const rule = await this.update(ruleId, { status, updatedBy });
            return rule;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to toggle rule status',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Private helper methods

    private async getApplicableRules(ruleType: string, context: IRuleContext): Promise<IRule[]> {
        const query: FilterQuery<IRule> = {
            ruleType,
            status: RuleStatus.ACTIVE,
            effectiveFrom: { $lte: context.timestamp }
        };

        // Add effective to filter
        if (context.timestamp) {
            query.$or = [
                { effectiveTo: { $exists: false } },
                { effectiveTo: { $gte: context.timestamp } }
            ];
        }

        // Add scope filters
        if (context.businessUnitId) {
            query.$or = [
                { businessUnitId: { $exists: false } },
                { businessUnitId: context.businessUnitId }
            ];
        }

        if (context.locationId) {
            query.$or = [
                { locationIds: { $size: 0 } },
                { locationIds: context.locationId }
            ];
        }

        if (context.programId) {
            query.$or = [
                { programIds: { $size: 0 } },
                { programIds: context.programId }
            ];
        }

        return await Rule.find(query).sort({ priority: -1, createdAt: 1 });
    }

    private async evaluateRule(rule: IRule, context: IRuleContext): Promise<IRuleEvaluationResult> {
        const startTime = Date.now();

        try {
            // Check if rule is applicable for current time
            if (!rule.isApplicableForTime(context.timestamp)) {
                return {
                    ruleId: rule._id.toString(),
                    ruleName: rule.name,
                    matched: false,
                    actions: [],
                    executedAt: new Date()
                };
            }

            // Evaluate conditions
            const conditionsMatch = this.evaluateConditions(rule.conditions, rule.conditionLogic, context);

            // Update rule statistics
            await this.updateRuleStatistics(rule._id.toString(), conditionsMatch);

            const result: IRuleEvaluationResult = {
                ruleId: rule._id.toString(),
                ruleName: rule.name,
                matched: conditionsMatch,
                actions: conditionsMatch ? rule.actions : [],
                executedAt: new Date()
            };

            return result;
        } catch (error) {
            return {
                ruleId: rule._id.toString(),
                ruleName: rule.name,
                matched: false,
                actions: [],
                message: `Error evaluating rule: ${error.message}`,
                executedAt: new Date()
            };
        }
    }

    private evaluateConditions(
        conditions: any[],
        logic: 'AND' | 'OR',
        context: IRuleContext
    ): boolean {
        if (conditions.length === 0) return true;

        const results = conditions.map(condition => this.evaluateCondition(condition, context));

        return logic === 'AND'
            ? results.every(result => result)
            : results.some(result => result);
    }

    private evaluateCondition(condition: any, context: IRuleContext): boolean {
        const fieldValue = this.getFieldValue(condition.field, context);
        const conditionValue = condition.value;

        switch (condition.operator) {
            case ConditionOperator.EQUALS:
                return fieldValue === conditionValue;
            case ConditionOperator.NOT_EQUALS:
                return fieldValue !== conditionValue;
            case ConditionOperator.GREATER_THAN:
                return fieldValue > conditionValue;
            case ConditionOperator.LESS_THAN:
                return fieldValue < conditionValue;
            case ConditionOperator.GREATER_THAN_OR_EQUAL:
                return fieldValue >= conditionValue;
            case ConditionOperator.LESS_THAN_OR_EQUAL:
                return fieldValue <= conditionValue;
            case ConditionOperator.CONTAINS:
                return String(fieldValue).includes(String(conditionValue));
            case ConditionOperator.NOT_CONTAINS:
                return !String(fieldValue).includes(String(conditionValue));
            case ConditionOperator.IN:
                return Array.isArray(conditionValue) && conditionValue.includes(fieldValue);
            case ConditionOperator.NOT_IN:
                return Array.isArray(conditionValue) && !conditionValue.includes(fieldValue);
            case ConditionOperator.IS_NULL:
                return fieldValue == null;
            case ConditionOperator.IS_NOT_NULL:
                return fieldValue != null;
            case ConditionOperator.BETWEEN:
                return Array.isArray(conditionValue) &&
                    fieldValue >= conditionValue[0] &&
                    fieldValue <= conditionValue[1];
            default:
                return false;
        }
    }

    private getFieldValue(field: string, context: IRuleContext): any {
        const parts = field.split('.');
        let value: any = context;

        for (const part of parts) {
            if (value && typeof value === 'object' && part in value) {
                value = value[part];
            } else {
                return undefined;
            }
        }

        return value;
    }

    private sortRulesByOrder(rules: IRule[], order: string): IRule[] {
        switch (order) {
            case 'priority':
                return rules.sort((a, b) => b.priority - a.priority);
            case 'creation_date':
                return rules.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
            default:
                return rules;
        }
    }

    private buildConditionsFromTemplate(template: IRuleTemplate, ruleData: any): any[] {
        // Build conditions based on template and provided data
        return template.conditionTemplate.fields.map(field => ({
            field,
            operator: template.conditionTemplate.operators[0] || ConditionOperator.EQUALS,
            value: ruleData.customParameters?.[field] || template.conditionTemplate.defaultValues.get(field),
            dataType: 'string'
        }));
    }

    private buildActionsFromTemplate(template: IRuleTemplate, ruleData: any): any[] {
        // Build actions based on template and provided data
        return template.actionTemplate.availableActions.map((actionType, index) => ({
            type: actionType,
            parameters: ruleData.customParameters || template.actionTemplate.defaultParameters,
            priority: index + 1
        }));
    }

    private async updateRuleStatistics(ruleId: string, matched: boolean): Promise<void> {
        const updateData: any = {
            $inc: { 'statistics.timesEvaluated': 1 },
            $set: { 'statistics.lastEvaluated': new Date() }
        };

        if (matched) {
            updateData.$inc['statistics.timesMatched'] = 1;
            updateData.$set['statistics.lastMatched'] = new Date();
        }

        await Rule.updateOne({ _id: ruleId }, updateData);
    }

    private async updatePolicyStatistics(policyId: string): Promise<void> {
        await Policy.updateOne(
            { _id: policyId },
            {
                $inc: { 'statistics.timesEvaluated': 1 },
                $set: { 'statistics.lastEvaluated': new Date() }
            }
        );
    }
}

export class PolicyService extends BaseService<IPolicy> {
    constructor() {
        super(Policy);
    }
}

export class RuleTemplateService extends BaseService<IRuleTemplate> {
    constructor() {
        super(RuleTemplate);
    }
}