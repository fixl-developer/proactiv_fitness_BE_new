import { Schema, model } from 'mongoose';
import {
    IRule,
    IPolicy,
    IRuleTemplate,
    RuleType,
    RuleStatus,
    ConditionOperator,
    ActionType
} from './rule.interface';
import { baseSchemaOptions } from '../../shared/base/base.model';

// Rule Condition Schema
const ruleConditionSchema = new Schema({
    field: {
        type: String,
        required: [true, 'Condition field is required'],
        trim: true
    },
    operator: {
        type: String,
        enum: Object.values(ConditionOperator),
        required: [true, 'Condition operator is required']
    },
    value: {
        type: Schema.Types.Mixed,
        required: [true, 'Condition value is required']
    },
    dataType: {
        type: String,
        enum: ['string', 'number', 'boolean', 'date', 'array'],
        required: [true, 'Data type is required']
    }
});

// Rule Action Schema
const ruleActionSchema = new Schema({
    type: {
        type: String,
        enum: Object.values(ActionType),
        required: [true, 'Action type is required']
    },
    parameters: {
        type: Map,
        of: Schema.Types.Mixed,
        default: new Map()
    },
    message: {
        type: String,
        trim: true
    },
    priority: {
        type: Number,
        required: [true, 'Action priority is required'],
        min: [1, 'Priority must be at least 1']
    }
});

// Time Slot Schema
const timeSlotSchema = new Schema({
    startTime: {
        type: String,
        required: [true, 'Start time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    endTime: {
        type: String,
        required: [true, 'End time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    }
});

// Rule Schema
const ruleSchema = new Schema<IRule>({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Rule name is required'],
        trim: true,
        maxlength: [100, 'Rule name cannot exceed 100 characters'],
        index: true
    },
    description: {
        type: String,
        required: [true, 'Rule description is required'],
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    ruleType: {
        type: String,
        enum: Object.values(RuleType),
        required: [true, 'Rule type is required'],
        index: true
    },
    category: {
        type: String,
        required: [true, 'Rule category is required'],
        trim: true,
        index: true
    },

    // Scope
    businessUnitId: {
        type: Schema.Types.ObjectId,
        ref: 'BusinessUnit',
        index: true
    },
    locationIds: [{
        type: Schema.Types.ObjectId,
        ref: 'Location'
    }],
    programIds: [{
        type: Schema.Types.ObjectId,
        ref: 'Program'
    }],

    // Rule Logic
    conditions: {
        type: [ruleConditionSchema],
        required: [true, 'At least one condition is required'],
        validate: {
            validator: function (conditions: any[]) {
                return conditions && conditions.length > 0;
            },
            message: 'At least one condition is required'
        }
    },
    conditionLogic: {
        type: String,
        enum: ['AND', 'OR'],
        default: 'AND'
    },
    actions: {
        type: [ruleActionSchema],
        required: [true, 'At least one action is required'],
        validate: {
            validator: function (actions: any[]) {
                return actions && actions.length > 0;
            },
            message: 'At least one action is required'
        }
    },

    // Priority and Execution
    priority: {
        type: Number,
        required: [true, 'Rule priority is required'],
        min: [1, 'Priority must be at least 1'],
        max: [1000, 'Priority cannot exceed 1000'],
        index: true
    },
    stopOnMatch: {
        type: Boolean,
        default: false
    },

    // Scheduling
    effectiveFrom: {
        type: Date,
        required: [true, 'Effective from date is required'],
        index: true
    },
    effectiveTo: {
        type: Date,
        index: true
    },

    // Days and Times
    applicableDays: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    applicableTimeSlots: [timeSlotSchema],

    // Status
    status: {
        type: String,
        enum: Object.values(RuleStatus),
        default: RuleStatus.DRAFT,
        index: true
    },

    // Versioning
    version: {
        type: Number,
        default: 1,
        min: [1, 'Version must be at least 1']
    },
    parentRuleId: {
        type: Schema.Types.ObjectId,
        ref: 'Rule'
    },

    // Usage Statistics
    statistics: {
        timesEvaluated: {
            type: Number,
            default: 0,
            min: [0, 'Times evaluated cannot be negative']
        },
        timesMatched: {
            type: Number,
            default: 0,
            min: [0, 'Times matched cannot be negative']
        },
        lastEvaluated: Date,
        lastMatched: Date
    },

    // Audit
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Created by is required']
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Updated by is required']
    }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Policy Schema
const policySchema = new Schema<IPolicy>({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Policy name is required'],
        trim: true,
        maxlength: [100, 'Policy name cannot exceed 100 characters'],
        index: true
    },
    description: {
        type: String,
        required: [true, 'Policy description is required'],
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    policyType: {
        type: String,
        enum: Object.values(RuleType),
        required: [true, 'Policy type is required'],
        index: true
    },

    // Scope
    businessUnitId: {
        type: Schema.Types.ObjectId,
        ref: 'BusinessUnit',
        index: true
    },
    locationIds: [{
        type: Schema.Types.ObjectId,
        ref: 'Location'
    }],
    programIds: [{
        type: Schema.Types.ObjectId,
        ref: 'Program'
    }],

    // Rules
    ruleIds: [{
        type: Schema.Types.ObjectId,
        ref: 'Rule',
        required: [true, 'At least one rule is required']
    }],
    ruleEvaluationOrder: {
        type: String,
        enum: ['priority', 'creation_date', 'custom'],
        default: 'priority'
    },

    // Default Actions
    defaultAction: {
        type: String,
        enum: Object.values(ActionType),
        required: [true, 'Default action is required']
    },
    defaultMessage: {
        type: String,
        trim: true
    },

    // Status
    status: {
        type: String,
        enum: Object.values(RuleStatus),
        default: RuleStatus.DRAFT,
        index: true
    },

    // Effective Period
    effectiveFrom: {
        type: Date,
        required: [true, 'Effective from date is required'],
        index: true
    },
    effectiveTo: {
        type: Date,
        index: true
    },

    // Statistics
    statistics: {
        timesEvaluated: {
            type: Number,
            default: 0,
            min: [0, 'Times evaluated cannot be negative']
        },
        averageEvaluationTime: {
            type: Number,
            default: 0,
            min: [0, 'Average evaluation time cannot be negative']
        },
        lastEvaluated: Date
    },

    // Audit
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Created by is required']
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Updated by is required']
    },
    version: {
        type: Number,
        default: 1,
        min: [1, 'Version must be at least 1']
    }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Rule Template Schema
const ruleTemplateSchema = new Schema<IRuleTemplate>({
    name: {
        type: String,
        required: [true, 'Template name is required'],
        trim: true,
        maxlength: [100, 'Template name cannot exceed 100 characters'],
        index: true
    },
    description: {
        type: String,
        required: [true, 'Template description is required'],
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    ruleType: {
        type: String,
        enum: Object.values(RuleType),
        required: [true, 'Rule type is required'],
        index: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        index: true
    },

    // Template Structure
    conditionTemplate: {
        fields: [{
            type: String,
            required: [true, 'Field is required']
        }],
        operators: [{
            type: String,
            enum: Object.values(ConditionOperator),
            required: [true, 'Operator is required']
        }],
        defaultValues: {
            type: Map,
            of: Schema.Types.Mixed,
            default: new Map()
        }
    },

    actionTemplate: {
        availableActions: [{
            type: String,
            enum: Object.values(ActionType),
            required: [true, 'Action is required']
        }],
        defaultParameters: {
            type: Map,
            of: Schema.Types.Mixed,
            default: new Map()
        }
    },

    // Usage
    isPublic: {
        type: Boolean,
        default: true,
        index: true
    },
    usageCount: {
        type: Number,
        default: 0,
        min: [0, 'Usage count cannot be negative']
    },

    // Audit
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Created by is required']
    }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Indexes for performance
ruleSchema.index({ ruleType: 1, status: 1, priority: -1 });
ruleSchema.index({ businessUnitId: 1, status: 1 });
ruleSchema.index({ locationIds: 1, status: 1 });
ruleSchema.index({ programIds: 1, status: 1 });
ruleSchema.index({ effectiveFrom: 1, effectiveTo: 1 });
ruleSchema.index({ category: 1, ruleType: 1 });

policySchema.index({ policyType: 1, status: 1 });
policySchema.index({ businessUnitId: 1, status: 1 });
policySchema.index({ locationIds: 1, status: 1 });
policySchema.index({ programIds: 1, status: 1 });
policySchema.index({ effectiveFrom: 1, effectiveTo: 1 });

ruleTemplateSchema.index({ ruleType: 1, isPublic: 1 });
ruleTemplateSchema.index({ category: 1, ruleType: 1 });

// Text search indexes
ruleSchema.index({
    name: 'text',
    description: 'text',
    category: 'text'
});

policySchema.index({
    name: 'text',
    description: 'text'
});

ruleTemplateSchema.index({
    name: 'text',
    description: 'text',
    category: 'text'
});

// Pre-save middleware
ruleSchema.pre('save', function (next) {
    // Validate effective dates
    if (this.effectiveTo && this.effectiveFrom >= this.effectiveTo) {
        return next(new Error('Effective from date must be before effective to date'));
    }

    // Validate time slots
    for (const timeSlot of this.applicableTimeSlots) {
        const startTime = new Date(`2000-01-01T${timeSlot.startTime}:00`);
        const endTime = new Date(`2000-01-01T${timeSlot.endTime}:00`);
        if (startTime >= endTime) {
            return next(new Error('Start time must be before end time'));
        }
    }

    // Update version if modified
    if (this.isModified() && !this.isNew) {
        this.version += 1;
    }

    next();
});

policySchema.pre('save', function (next) {
    // Validate effective dates
    if (this.effectiveTo && this.effectiveFrom >= this.effectiveTo) {
        return next(new Error('Effective from date must be before effective to date'));
    }

    // Update version if modified
    if (this.isModified() && !this.isNew) {
        this.version += 1;
    }

    next();
});

// Instance methods
ruleSchema.methods.isEffective = function (date?: Date) {
    const checkDate = date || new Date();

    if (this.status !== RuleStatus.ACTIVE) {
        return false;
    }

    if (checkDate < this.effectiveFrom) {
        return false;
    }

    if (this.effectiveTo && checkDate > this.effectiveTo) {
        return false;
    }

    return true;
};

ruleSchema.methods.isApplicableForTime = function (date: Date) {
    if (!this.isEffective(date)) {
        return false;
    }

    // Check day of week
    if (this.applicableDays.length > 0) {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[date.getDay()];
        if (!this.applicableDays.includes(dayName)) {
            return false;
        }
    }

    // Check time slots
    if (this.applicableTimeSlots.length > 0) {
        const currentTime = date.toTimeString().substring(0, 5); // HH:MM format
        const isInTimeSlot = this.applicableTimeSlots.some((slot: any) => {
            return currentTime >= slot.startTime && currentTime <= slot.endTime;
        });

        if (!isInTimeSlot) {
            return false;
        }
    }

    return true;
};

policySchema.methods.isEffective = function (date?: Date) {
    const checkDate = date || new Date();

    if (this.status !== RuleStatus.ACTIVE) {
        return false;
    }

    if (checkDate < this.effectiveFrom) {
        return false;
    }

    if (this.effectiveTo && checkDate > this.effectiveTo) {
        return false;
    }

    return true;
};

// Virtual fields
ruleSchema.virtual('isActive').get(function () {
    return this.status === RuleStatus.ACTIVE && this.isEffective();
});

ruleSchema.virtual('matchRate').get(function () {
    if (this.statistics.timesEvaluated === 0) {
        return 0;
    }
    return (this.statistics.timesMatched / this.statistics.timesEvaluated) * 100;
});

policySchema.virtual('isActive').get(function () {
    return this.status === RuleStatus.ACTIVE && this.isEffective();
});

// Export models
export const Rule = model<IRule>('Rule', ruleSchema);
export const Policy = model<IPolicy>('Policy', policySchema);
export const RuleTemplate = model<IRuleTemplate>('RuleTemplate', ruleTemplateSchema);