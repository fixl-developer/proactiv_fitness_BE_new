import { AutomationRule, IAutomationRule } from './automation-rule.model';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';

export class AutomationRuleService {
    async list(filters: any = {}): Promise<IAutomationRule[]> {
        const query: any = {};
        if (typeof filters.isActive === 'boolean') query.isActive = filters.isActive;
        if (filters.trigger) query.trigger = filters.trigger;
        return AutomationRule.find(query).sort({ createdAt: -1 }).lean() as any;
    }

    async create(data: Partial<IAutomationRule>, createdBy: string): Promise<IAutomationRule> {
        if (!data.name || !data.trigger) {
            throw new AppError('name and trigger are required', HTTP_STATUS.BAD_REQUEST);
        }
        const ruleId = `AR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        return AutomationRule.create({
            ruleId,
            name: data.name,
            description: data.description,
            trigger: data.trigger,
            conditions: data.conditions || [],
            actions: data.actions || [],
            isActive: data.isActive ?? true,
            createdBy,
        });
    }

    async update(ruleId: string, updates: Partial<IAutomationRule>, updatedBy: string): Promise<IAutomationRule> {
        const rule = await AutomationRule.findOneAndUpdate(
            { ruleId },
            { ...updates, updatedBy },
            { new: true }
        );
        if (!rule) throw new AppError('Rule not found', HTTP_STATUS.NOT_FOUND);
        return rule;
    }

    async delete(ruleId: string): Promise<void> {
        const result = await AutomationRule.deleteOne({ ruleId });
        if (result.deletedCount === 0) throw new AppError('Rule not found', HTTP_STATUS.NOT_FOUND);
    }
}
