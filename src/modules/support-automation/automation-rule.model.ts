import { Schema, model, Document } from 'mongoose';

export interface IAutomationRule extends Document {
    ruleId: string;
    name: string;
    description?: string;
    trigger: 'ticket_created' | 'ticket_updated' | 'ticket_escalated' | 'sla_breached' | string;
    conditions: { field: string; operator: string; value: string }[];
    actions: { type: string; value: string }[];
    isActive: boolean;
    createdBy: string;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AutomationRuleSchema = new Schema<IAutomationRule>({
    ruleId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    description: String,
    trigger: { type: String, required: true },
    conditions: [{
        field: String,
        operator: String,
        value: String,
        _id: false,
    }],
    actions: [{
        type: { type: String },
        value: String,
        _id: false,
    }],
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: String, required: true },
    updatedBy: String,
}, { timestamps: true });

export const AutomationRule = model<IAutomationRule>('SupportAutomationRule', AutomationRuleSchema);
