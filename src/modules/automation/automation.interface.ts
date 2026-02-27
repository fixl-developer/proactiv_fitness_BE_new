import { Document } from 'mongoose';

export enum TriggerType {
    EVENT = 'event',
    SCHEDULE = 'schedule',
    WEBHOOK = 'webhook',
    MANUAL = 'manual',
    API_CALL = 'api_call',
    DATABASE_CHANGE = 'database_change',
    FILE_UPLOAD = 'file_upload',
    EMAIL_RECEIVED = 'email_received'
}

export enum ConditionOperator {
    EQUALS = 'equals',
    NOT_EQUALS = 'not_equals',
    GREATER_THAN = 'greater_than',
    LESS_THAN = 'less_than',
    GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
    LESS_THAN_OR_EQUAL = 'less_than_or_equal',
    CONTAINS = 'contains',
    NOT_CONTAINS = 'not_contains',
    STARTS_WITH = 'starts_with',
    ENDS_WITH = 'ends_with',
    IN = 'in',
    NOT_IN = 'not_in',
    IS_NULL = 'is_null',
    IS_NOT_NULL = 'is_not_null',
    REGEX_MATCH = 'regex_match'
}

export enum ActionType {
    SEND_EMAIL = 'send_email',
    SEND_SMS = 'send_sms',
    SEND_PUSH_NOTIFICATION = 'send_push_notification',
    CREATE_TASK = 'create_task',
    UPDATE_RECORD = 'update_record',
    CREATE_RECORD = 'create_record',
    DELETE_RECORD = 'delete_record',
    CALL_WEBHOOK = 'call_webhook',
    CALL_API = 'call_api',
    EXECUTE_FUNCTION = 'execute_function',
    SEND_SLACK_MESSAGE = 'send_slack_message',
    CREATE_CALENDAR_EVENT = 'create_calendar_event',
    GENERATE_REPORT = 'generate_report',
    TRIGGER_WORKFLOW = 'trigger_workflow',
    DELAY = 'delay',
    CONDITION = 'condition',
    LOOP = 'loop',
    PARALLEL = 'parallel'
}

export enum WorkflowStatus {
    DRAFT = 'draft',
    ACTIVE = 'active',
    PAUSED = 'paused',
    DISABLED = 'disabled',
    ERROR = 'error'
}

export enum ExecutionStatus {
    PENDING = 'pending',
    RUNNING = 'running',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
    TIMEOUT = 'timeout'
}

export enum ExecutionMode {
    SYNCHRONOUS = 'synchronous',
    ASYNCHRONOUS = 'asynchronous',
    BACKGROUND = 'background'
}

export interface ITriggerConfig {
    type: TriggerType;
    config: {
        // Event trigger
        eventTypes?: string[];
        eventFilters?: Record<string, any>;

        // Schedule trigger
        cronExpression?: string;
        timezone?: string;
        startDate?: Date;
        endDate?: Date;

        // Webhook trigger
        webhookUrl?: string;
        httpMethod?: string;
        headers?: Record<string, string>;

        // Database change trigger
        collection?: string;
        operation?: 'insert' | 'update' | 'delete';
        fields?: string[];

        // File upload trigger
        uploadPath?: string;
        fileTypes?: string[];

        // Custom configuration
        customConfig?: Record<string, any>;
    };
}

export interface ICondition {
    field: string;
    operator: ConditionOperator;
    value: any;
    dataType: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
}

export interface IConditionGroup {
    logic: 'AND' | 'OR';
    conditions: ICondition[];
    groups?: IConditionGroup[];
}

export interface IActionConfig {
    type: ActionType;
    config: {
        // Email action
        to?: string[];
        cc?: string[];
        bcc?: string[];
        subject?: string;
        template?: string;
        templateData?: Record<string, any>;

        // SMS action
        phoneNumbers?: string[];
        message?: string;

        // Push notification action
        userIds?: string[];
        title?: string;
        body?: string;
        data?: Record<string, any>;

        // Task action
        title?: string;
        description?: string;
        assignedTo?: string;
        dueDate?: Date;
        priority?: 'low' | 'medium' | 'high' | 'critical';

        // Record actions
        collection?: string;
        recordId?: string;
        data?: Record<string, any>;

        // Webhook/API actions
        url?: string;
        method?: string;
        headers?: Record<string, string>;
        body?: any;
        timeout?: number;

        // Function action
        functionName?: string;
        parameters?: Record<string, any>;

        // Delay action
        duration?: number;
        unit?: 'seconds' | 'minutes' | 'hours' | 'days';

        // Condition action
        conditionGroup?: IConditionGroup;
        trueActions?: IActionConfig[];
        falseActions?: IActionConfig[];

        // Loop action
        iterations?: number;
        loopVariable?: string;
        loopData?: any[];
        loopActions?: IActionConfig[];

        // Parallel action
        parallelActions?: IActionConfig[];
        waitForAll?: boolean;

        // Custom configuration
        customConfig?: Record<string, any>;
    };

    // Action metadata
    name?: string;
    description?: string;
    timeout?: number;
    retryPolicy?: {
        maxRetries: number;
        backoffStrategy: 'linear' | 'exponential';
        initialDelay: number;
        maxDelay: number;
    };

    // Conditional execution
    runCondition?: IConditionGroup;

    // Error handling
    onError?: 'stop' | 'continue' | 'retry' | 'fallback';
    fallbackActions?: IActionConfig[];
}

export interface IWorkflow extends Document {
    // Basic Information
    workflowId: string;
    name: string;
    description?: string;
    version: string;

    // Configuration
    trigger: ITriggerConfig;
    conditions?: IConditionGroup;
    actions: IActionConfig[];

    // Settings
    executionMode: ExecutionMode;
    timeout: number; // in seconds
    maxConcurrentExecutions: number;

    // Status and Control
    status: WorkflowStatus;
    isActive: boolean;

    // Rate Limiting
    rateLimitEnabled: boolean;
    rateLimitConfig?: {
        maxExecutions: number;
        timeWindow: number; // in seconds
        resetStrategy: 'sliding' | 'fixed';
    };

    // Scheduling
    scheduleEnabled: boolean;
    scheduleConfig?: {
        cronExpression: string;
        timezone: string;
        startDate?: Date;
        endDate?: Date;
    };

    // Error Handling
    errorHandling: {
        onFailure: 'stop' | 'continue' | 'retry';
        maxRetries: number;
        retryDelay: number;
        notifyOnFailure: boolean;
        notificationRecipients: string[];
    };

    // Statistics
    statistics: {
        totalExecutions: number;
        successfulExecutions: number;
        failedExecutions: number;
        averageExecutionTime: number;
        lastExecutedAt?: Date;
        lastSuccessAt?: Date;
        lastFailureAt?: Date;
    };

    // Business Context
    businessUnitId?: string;
    locationIds: string[];
    tags: string[];

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IWorkflowExecution extends Document {
    // Basic Information
    executionId: string;
    workflowId: string;
    workflowVersion: string;

    // Trigger Information
    triggeredBy: string;
    triggerData: any;
    triggerSource: string;

    // Execution Details
    status: ExecutionStatus;
    executionMode: ExecutionMode;

    // Timing
    startedAt: Date;
    completedAt?: Date;
    executionTime?: number;

    // Context
    context: Record<string, any>;
    variables: Record<string, any>;

    // Steps
    steps: IExecutionStep[];
    currentStepIndex: number;

    // Results
    result?: any;
    error?: string;

    // Retry Information
    retryCount: number;
    maxRetries: number;
    nextRetryAt?: Date;

    // Audit
    createdAt: Date;
    updatedAt: Date;
}

export interface IExecutionStep {
    stepId: string;
    stepName: string;
    stepType: ActionType;

    // Status
    status: ExecutionStatus;

    // Timing
    startedAt: Date;
    completedAt?: Date;
    executionTime?: number;

    // Input/Output
    input: any;
    output?: any;
    error?: string;

    // Retry Information
    retryCount: number;
    maxRetries: number;

    // Metadata
    metadata?: Record<string, any>;
}

export interface IAutomationRule extends Document {
    // Basic Information
    ruleId: string;
    name: string;
    description?: string;

    // Rule Configuration
    trigger: ITriggerConfig;
    conditions: IConditionGroup;
    actions: IActionConfig[];

    // Settings
    priority: number;
    isActive: boolean;

    // Execution Settings
    executionMode: ExecutionMode;
    timeout: number;

    // Business Context
    businessUnitId?: string;
    locationIds: string[];

    // Statistics
    statistics: {
        totalTriggers: number;
        successfulExecutions: number;
        failedExecutions: number;
        lastTriggeredAt?: Date;
    };

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IWorkflowTemplate extends Document {
    // Basic Information
    templateId: string;
    name: string;
    description?: string;
    category: string;

    // Template Configuration
    triggerTemplate: ITriggerConfig;
    conditionsTemplate?: IConditionGroup;
    actionsTemplate: IActionConfig[];

    // Settings
    isPublic: boolean;
    usageCount: number;

    // Customization
    customizableFields: string[];
    defaultValues: Record<string, any>;

    // Audit
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Request/Response Interfaces
export interface ICreateWorkflowRequest {
    name: string;
    description?: string;
    trigger: ITriggerConfig;
    conditions?: IConditionGroup;
    actions: IActionConfig[];
    executionMode?: ExecutionMode;
    timeout?: number;
    maxConcurrentExecutions?: number;
    businessUnitId?: string;
    locationIds?: string[];
    tags?: string[];
}

export interface IExecuteWorkflowRequest {
    workflowId: string;
    triggerData?: any;
    context?: Record<string, any>;
    variables?: Record<string, any>;
    executionMode?: ExecutionMode;
}

export interface IWorkflowFilter {
    status?: WorkflowStatus;
    businessUnitId?: string;
    locationId?: string;
    tags?: string[];
    createdBy?: string;
    isActive?: boolean;
    searchText?: string;
}

export interface IExecutionFilter {
    workflowId?: string;
    status?: ExecutionStatus;
    triggeredBy?: string;
    dateRange?: {
        startDate: Date;
        endDate: Date;
    };
    executionMode?: ExecutionMode;
}

export interface IWorkflowStatistics {
    totalWorkflows: number;
    activeWorkflows: number;
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    workflowsByStatus: Record<WorkflowStatus, number>;
    executionsByStatus: Record<ExecutionStatus, number>;
    topWorkflows: {
        workflowId: string;
        workflowName: string;
        executionCount: number;
        successRate: number;
    }[];
    executionTrends: {
        date: Date;
        executions: number;
        successes: number;
        failures: number;
    }[];
}

// Workflow Builder Interfaces
export interface IWorkflowNode {
    id: string;
    type: 'trigger' | 'condition' | 'action';
    position: { x: number; y: number };
    data: ITriggerConfig | IConditionGroup | IActionConfig;
    connections: string[];
}

export interface IWorkflowCanvas {
    nodes: IWorkflowNode[];
    connections: {
        from: string;
        to: string;
        condition?: 'true' | 'false' | 'always';
    }[];
}

// Integration Interfaces
export interface IIntegrationConfig {
    integrationId: string;
    name: string;
    type: 'webhook' | 'api' | 'database' | 'email' | 'sms' | 'slack' | 'calendar';
    config: Record<string, any>;
    isActive: boolean;
    businessUnitId?: string;
}

// Simulation Interfaces
export interface IWorkflowSimulation {
    simulationId: string;
    workflowId: string;
    simulationData: any;
    results: {
        stepResults: {
            stepId: string;
            stepName: string;
            input: any;
            output: any;
            success: boolean;
            error?: string;
        }[];
        finalResult: any;
        executionTime: number;
        success: boolean;
        error?: string;
    };
    createdAt: Date;
}