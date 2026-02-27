import { Schema, model } from 'mongoose';
import {
    IWorkflow,
    IWorkflowExecution,
    IAutomationRule,
    IWorkflowTemplate,
    TriggerType,
    ConditionOperator,
    ActionType,
    WorkflowStatus,
    ExecutionStatus,
    ExecutionMode
} from './automation.interface';
import { baseSchemaOptions } from '../../shared/base/base.model';

// Trigger Config Schema
const triggerConfigSchema = new Schema({
    type: {
        type: String,
        enum: Object.values(TriggerType),
        required: [true, 'Trigger type is required']
    },
    config: {
        eventTypes: [String],
        eventFilters: Schema.Types.Mixed,
        cronExpression: String,
        timezone: String,
        startDate: Date,
        endDate: Date,
        webhookUrl: String,
        httpMethod: String,
        headers: { type: Map, of: String },
        collection: String,
        operation: { type: String, enum: ['insert', 'update', 'delete'] },
        fields: [String],
        uploadPath: String,
        fileTypes: [String],
        customConfig: Schema.Types.Mixed
    }
});

// Condition Schema
const conditionSchema = new Schema({
    field: { type: String, required: true },
    operator: { type: String, enum: Object.values(ConditionOperator), required: true },
    value: Schema.Types.Mixed,
    dataType: { type: String, enum: ['string', 'number', 'boolean', 'date', 'array', 'object'], required: true }
});

// Condition Group Schema
const conditionGroupSchema = new Schema({
    logic: { type: String, enum: ['AND', 'OR'], required: true },
    conditions: [conditionSchema],
    groups: [{ type: Schema.Types.ObjectId, ref: 'ConditionGroup' }]
});

// Action Config Schema
const actionConfigSchema = new Schema({
    type: {
        type: String,
        enum: Object.values(ActionType),
        required: [true, 'Action type is required']
    },
    config: {
        to: [String],
        cc: [String],
        bcc: [String],
        subject: String,
        template: String,
        templateData: Schema.Types.Mixed,
        phoneNumbers: [String],
        message: String,
        userIds: [String],
        title: String,
        body: String,
        data: Schema.Types.Mixed,
        description: String,
        assignedTo: String,
        dueDate: Date,
        priority: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
        collection: String,
        recordId: String,
        url: String,
        method: String,
        headers: { type: Map, of: String },
        timeout: Number,
        functionName: String,
        parameters: Schema.Types.Mixed,
        duration: Number,
        unit: { type: String, enum: ['seconds', 'minutes', 'hours', 'days'] },
        conditionGroup: conditionGroupSchema,
        trueActions: [{ type: Schema.Types.ObjectId, ref: 'ActionConfig' }],
        falseActions: [{ type: Schema.Types.ObjectId, ref: 'ActionConfig' }],
        iterations: Number,
        loopVariable: String,
        loopData: [Schema.Types.Mixed],
        loopActions: [{ type: Schema.Types.ObjectId, ref: 'ActionConfig' }],
        parallelActions: [{ type: Schema.Types.ObjectId, ref: 'ActionConfig' }],
        waitForAll: Boolean,
        customConfig: Schema.Types.Mixed
    },
    name: String,
    description: String,
    timeout: Number,
    retryPolicy: {
        maxRetries: { type: Number, default: 3 },
        backoffStrategy: { type: String, enum: ['linear', 'exponential'], default: 'exponential' },
        initialDelay: { type: Number, default: 1000 },
        maxDelay: { type: Number, default: 300000 }
    },
    runCondition: conditionGroupSchema,
    onError: { type: String, enum: ['stop', 'continue', 'retry', 'fallback'], default: 'stop' },
    fallbackActions: [{ type: Schema.Types.ObjectId, ref: 'ActionConfig' }]
});

// Execution Step Schema
const executionStepSchema = new Schema({
    stepId: { type: String, required: true },
    stepName: { type: String, required: true },
    stepType: { type: String, enum: Object.values(ActionType), required: true },
    status: { type: String, enum: Object.values(ExecutionStatus), default: ExecutionStatus.PENDING },
    startedAt: { type: Date, required: true },
    completedAt: Date,
    executionTime: Number,
    input: Schema.Types.Mixed,
    output: Schema.Types.Mixed,
    error: String,
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
    metadata: Schema.Types.Mixed
});

// Workflow Schema
const workflowSchema = new Schema<IWorkflow>({
    workflowId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    version: { type: String, required: true, default: '1.0.0' },

    trigger: { type: triggerConfigSchema, required: true },
    conditions: conditionGroupSchema,
    actions: { type: [actionConfigSchema], required: true },

    executionMode: { type: String, enum: Object.values(ExecutionMode), default: ExecutionMode.ASYNCHRONOUS },
    timeout: { type: Number, default: 300, min: 1 },
    maxConcurrentExecutions: { type: Number, default: 1, min: 1 },

    status: { type: String, enum: Object.values(WorkflowStatus), default: WorkflowStatus.DRAFT, index: true },
    isActive: { type: Boolean, default: false, index: true },

    rateLimitEnabled: { type: Boolean, default: false },
    rateLimitConfig: {
        maxExecutions: { type: Number, min: 1 },
        timeWindow: { type: Number, min: 1 },
        resetStrategy: { type: String, enum: ['sliding', 'fixed'], default: 'sliding' }
    },

    scheduleEnabled: { type: Boolean, default: false },
    scheduleConfig: {
        cronExpression: String,
        timezone: { type: String, default: 'UTC' },
        startDate: Date,
        endDate: Date
    },

    errorHandling: {
        onFailure: { type: String, enum: ['stop', 'continue', 'retry'], default: 'stop' },
        maxRetries: { type: Number, default: 3, min: 0 },
        retryDelay: { type: Number, default: 5000, min: 0 },
        notifyOnFailure: { type: Boolean, default: false },
        notificationRecipients: [String]
    },

    statistics: {
        totalExecutions: { type: Number, default: 0, min: 0 },
        successfulExecutions: { type: Number, default: 0, min: 0 },
        failedExecutions: { type: Number, default: 0, min: 0 },
        averageExecutionTime: { type: Number, default: 0, min: 0 },
        lastExecutedAt: Date,
        lastSuccessAt: Date,
        lastFailureAt: Date
    },

    businessUnitId: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', index: true },
    locationIds: [{ type: Schema.Types.ObjectId, ref: 'Location' }],
    tags: [String],

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Workflow Execution Schema
const workflowExecutionSchema = new Schema<IWorkflowExecution>({
    executionId: { type: String, required: true, unique: true, index: true },
    workflowId: { type: String, required: true, index: true },
    workflowVersion: { type: String, required: true },

    triggeredBy: { type: String, required: true },
    triggerData: Schema.Types.Mixed,
    triggerSource: { type: String, required: true },

    status: { type: String, enum: Object.values(ExecutionStatus), default: ExecutionStatus.PENDING, index: true },
    executionMode: { type: String, enum: Object.values(ExecutionMode), required: true },

    startedAt: { type: Date, required: true, index: true },
    completedAt: Date,
    executionTime: Number,

    context: { type: Schema.Types.Mixed, default: {} },
    variables: { type: Schema.Types.Mixed, default: {} },

    steps: [executionStepSchema],
    currentStepIndex: { type: Number, default: 0, min: 0 },

    result: Schema.Types.Mixed,
    error: String,

    retryCount: { type: Number, default: 0, min: 0 },
    maxRetries: { type: Number, default: 3, min: 0 },
    nextRetryAt: Date
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Automation Rule Schema
const automationRuleSchema = new Schema<IAutomationRule>({
    ruleId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },

    trigger: { type: triggerConfigSchema, required: true },
    conditions: { type: conditionGroupSchema, required: true },
    actions: { type: [actionConfigSchema], required: true },

    priority: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },

    executionMode: { type: String, enum: Object.values(ExecutionMode), default: ExecutionMode.ASYNCHRONOUS },
    timeout: { type: Number, default: 300, min: 1 },

    businessUnitId: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', index: true },
    locationIds: [{ type: Schema.Types.ObjectId, ref: 'Location' }],

    statistics: {
        totalTriggers: { type: Number, default: 0, min: 0 },
        successfulExecutions: { type: Number, default: 0, min: 0 },
        failedExecutions: { type: Number, default: 0, min: 0 },
        lastTriggeredAt: Date
    },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Workflow Template Schema
const workflowTemplateSchema = new Schema<IWorkflowTemplate>({
    templateId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    category: { type: String, required: true, index: true },

    triggerTemplate: { type: triggerConfigSchema, required: true },
    conditionsTemplate: conditionGroupSchema,
    actionsTemplate: { type: [actionConfigSchema], required: true },

    isPublic: { type: Boolean, default: false, index: true },
    usageCount: { type: Number, default: 0, min: 0 },

    customizableFields: [String],
    defaultValues: { type: Schema.Types.Mixed, default: {} },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Indexes
workflowSchema.index({ businessUnitId: 1, status: 1 });
workflowSchema.index({ tags: 1, isActive: 1 });
workflowSchema.index({ 'trigger.type': 1, isActive: 1 });

workflowExecutionSchema.index({ workflowId: 1, status: 1 });
workflowExecutionSchema.index({ triggeredBy: 1, startedAt: -1 });
workflowExecutionSchema.index({ status: 1, startedAt: -1 });

automationRuleSchema.index({ businessUnitId: 1, isActive: 1 });
automationRuleSchema.index({ priority: -1, isActive: 1 });
automationRuleSchema.index({ 'trigger.type': 1, isActive: 1 });

workflowTemplateSchema.index({ category: 1, isPublic: 1 });
workflowTemplateSchema.index({ usageCount: -1 });

// Pre-save middleware
workflowSchema.pre('save', function (next) {
    if (this.isNew && !this.workflowId) {
        this.workflowId = `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

workflowExecutionSchema.pre('save', function (next) {
    if (this.isNew && !this.executionId) {
        this.executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

automationRuleSchema.pre('save', function (next) {
    if (this.isNew && !this.ruleId) {
        this.ruleId = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

workflowTemplateSchema.pre('save', function (next) {
    if (this.isNew && !this.templateId) {
        this.templateId = `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

// Export models
export const Workflow = model<IWorkflow>('Workflow', workflowSchema);
export const WorkflowExecution = model<IWorkflowExecution>('WorkflowExecution', workflowExecutionSchema);
export const AutomationRule = model<IAutomationRule>('AutomationRule', automationRuleSchema);
export const WorkflowTemplate = model<IWorkflowTemplate>('WorkflowTemplate', workflowTemplateSchema);