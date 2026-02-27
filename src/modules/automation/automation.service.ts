import { FilterQuery } from 'mongoose';
import { Workflow, WorkflowExecution, AutomationRule, WorkflowTemplate } from './automation.model';
import {
    IWorkflow,
    IWorkflowExecution,
    IAutomationRule,
    IWorkflowTemplate,
    ICreateWorkflowRequest,
    IExecuteWorkflowRequest,
    IWorkflowFilter,
    IExecutionFilter,
    IWorkflowStatistics,
    WorkflowStatus,
    ExecutionStatus,
    ExecutionMode,
    TriggerType,
    ActionType
} from './automation.interface';
import { BaseService } from '../../shared/base/base.service';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';

export class AutomationService extends BaseService<IWorkflow> {
    constructor() {
        super(Workflow);
    }

    /**
     * Create workflow
     */
    async createWorkflow(workflowRequest: ICreateWorkflowRequest, createdBy: string): Promise<IWorkflow> {
        try {
            const workflowId = this.generateWorkflowId();

            const workflow = new Workflow({
                workflowId,
                name: workflowRequest.name,
                description: workflowRequest.description,
                trigger: workflowRequest.trigger,
                conditions: workflowRequest.conditions,
                actions: workflowRequest.actions,
                executionMode: workflowRequest.executionMode || ExecutionMode.ASYNCHRONOUS,
                timeout: workflowRequest.timeout || 300,
                maxConcurrentExecutions: workflowRequest.maxConcurrentExecutions || 1,
                businessUnitId: workflowRequest.businessUnitId,
                locationIds: workflowRequest.locationIds || [],
                tags: workflowRequest.tags || [],
                createdBy,
                updatedBy: createdBy
            });

            await workflow.save();
            return workflow;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create workflow',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Execute workflow
     */
    async executeWorkflow(executeRequest: IExecuteWorkflowRequest, triggeredBy: string): Promise<IWorkflowExecution> {
        try {
            const workflow = await Workflow.findOne({
                workflowId: executeRequest.workflowId,
                isActive: true,
                status: WorkflowStatus.ACTIVE
            });

            if (!workflow) {
                throw new AppError('Workflow not found or inactive', HTTP_STATUS.NOT_FOUND);
            }

            // Check concurrent execution limit
            const runningExecutions = await WorkflowExecution.countDocuments({
                workflowId: executeRequest.workflowId,
                status: { $in: [ExecutionStatus.PENDING, ExecutionStatus.RUNNING] }
            });

            if (runningExecutions >= workflow.maxConcurrentExecutions) {
                throw new AppError('Maximum concurrent executions reached', HTTP_STATUS.TOO_MANY_REQUESTS);
            }

            // Create execution
            const executionId = this.generateExecutionId();
            const execution = new WorkflowExecution({
                executionId,
                workflowId: workflow.workflowId,
                workflowVersion: workflow.version,
                triggeredBy,
                triggerData: executeRequest.triggerData || {},
                triggerSource: 'manual',
                executionMode: executeRequest.executionMode || workflow.executionMode,
                startedAt: new Date(),
                context: executeRequest.context || {},
                variables: executeRequest.variables || {},
                steps: this.generateExecutionSteps(workflow.actions),
                maxRetries: workflow.errorHandling.maxRetries
            });

            await execution.save();

            // Start execution
            if (execution.executionMode === ExecutionMode.SYNCHRONOUS) {
                await this.processExecution(execution);
            } else {
                // Queue for background processing
                this.processExecutionAsync(execution);
            }

            // Update workflow statistics
            workflow.statistics.totalExecutions += 1;
            workflow.statistics.lastExecutedAt = new Date();
            await workflow.save();

            return execution;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to execute workflow',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Process workflow execution
     */
    async processExecution(execution: IWorkflowExecution): Promise<void> {
        try {
            execution.status = ExecutionStatus.RUNNING;
            await execution.save();

            const workflow = await Workflow.findOne({ workflowId: execution.workflowId });
            if (!workflow) {
                throw new Error('Workflow not found');
            }

            // Execute steps sequentially
            for (let i = 0; i < execution.steps.length; i++) {
                const step = execution.steps[i];
                execution.currentStepIndex = i;

                try {
                    step.status = ExecutionStatus.RUNNING;
                    step.startedAt = new Date();
                    await execution.save();

                    // Execute step based on action type
                    const result = await this.executeStep(step, execution, workflow);

                    step.status = ExecutionStatus.COMPLETED;
                    step.completedAt = new Date();
                    step.executionTime = step.completedAt.getTime() - step.startedAt.getTime();
                    step.output = result;

                } catch (stepError: any) {
                    step.status = ExecutionStatus.FAILED;
                    step.error = stepError.message;
                    step.completedAt = new Date();

                    // Handle error based on workflow configuration
                    if (workflow.errorHandling.onFailure === 'stop') {
                        throw stepError;
                    }
                    // Continue with next step if configured to continue
                }

                await execution.save();
            }

            // Mark execution as completed
            execution.status = ExecutionStatus.COMPLETED;
            execution.completedAt = new Date();
            execution.executionTime = execution.completedAt.getTime() - execution.startedAt.getTime();

            // Update workflow statistics
            workflow.statistics.successfulExecutions += 1;
            workflow.statistics.lastSuccessAt = new Date();
            workflow.statistics.averageExecutionTime =
                (workflow.statistics.averageExecutionTime * (workflow.statistics.successfulExecutions - 1) +
                    execution.executionTime) / workflow.statistics.successfulExecutions;

        } catch (error: any) {
            execution.status = ExecutionStatus.FAILED;
            execution.error = error.message;
            execution.completedAt = new Date();

            // Update workflow statistics
            const workflow = await Workflow.findOne({ workflowId: execution.workflowId });
            if (workflow) {
                workflow.statistics.failedExecutions += 1;
                workflow.statistics.lastFailureAt = new Date();
                await workflow.save();
            }
        }

        await execution.save();
    }

    /**
     * Update workflow status
     */
    async updateWorkflowStatus(workflowId: string, status: WorkflowStatus, updatedBy: string): Promise<IWorkflow> {
        try {
            const workflow = await Workflow.findOne({ workflowId });
            if (!workflow) {
                throw new AppError('Workflow not found', HTTP_STATUS.NOT_FOUND);
            }

            workflow.status = status;
            workflow.isActive = status === WorkflowStatus.ACTIVE;
            workflow.updatedBy = updatedBy;
            await workflow.save();

            return workflow;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to update workflow status',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get workflow statistics
     */
    async getWorkflowStatistics(businessUnitId?: string): Promise<IWorkflowStatistics> {
        try {
            const matchStage: any = {};
            if (businessUnitId) {
                matchStage.businessUnitId = businessUnitId;
            }

            const stats = await Workflow.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalWorkflows: { $sum: 1 },
                        activeWorkflows: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
                        totalExecutions: { $sum: '$statistics.totalExecutions' },
                        successfulExecutions: { $sum: '$statistics.successfulExecutions' },
                        failedExecutions: { $sum: '$statistics.failedExecutions' },
                        totalExecutionTime: { $sum: { $multiply: ['$statistics.averageExecutionTime', '$statistics.successfulExecutions'] } },
                        workflowsByStatus: { $push: '$status' }
                    }
                }
            ]);

            const result = stats[0] || {};
            const totalExecutions = result.totalExecutions || 0;
            const successfulExecutions = result.successfulExecutions || 0;

            return {
                totalWorkflows: result.totalWorkflows || 0,
                activeWorkflows: result.activeWorkflows || 0,
                totalExecutions,
                successfulExecutions,
                failedExecutions: result.failedExecutions || 0,
                averageExecutionTime: successfulExecutions > 0 ? result.totalExecutionTime / successfulExecutions : 0,
                workflowsByStatus: this.countArrayItems(result.workflowsByStatus || []),
                executionsByStatus: {},
                topWorkflows: [],
                executionTrends: []
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get workflow statistics',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Create automation rule
     */
    async createAutomationRule(ruleData: any, createdBy: string): Promise<IAutomationRule> {
        try {
            const ruleId = this.generateRuleId();

            const rule = new AutomationRule({
                ruleId,
                ...ruleData,
                createdBy,
                updatedBy: createdBy
            });

            await rule.save();
            return rule;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create automation rule',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Create workflow template
     */
    async createWorkflowTemplate(templateData: any, createdBy: string): Promise<IWorkflowTemplate> {
        try {
            const templateId = this.generateTemplateId();

            const template = new WorkflowTemplate({
                templateId,
                ...templateData,
                createdBy
            });

            await template.save();
            return template;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create workflow template',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Private helper methods

    private async processExecutionAsync(execution: IWorkflowExecution): Promise<void> {
        // Queue for background processing
        setTimeout(() => {
            this.processExecution(execution).catch(console.error);
        }, 0);
    }

    private async executeStep(step: any, execution: IWorkflowExecution, workflow: IWorkflow): Promise<any> {
        // Find the action configuration
        const action = workflow.actions.find(a => a.name === step.stepName);
        if (!action) {
            throw new Error(`Action configuration not found for step: ${step.stepName}`);
        }

        // Execute based on action type
        switch (step.stepType) {
            case ActionType.SEND_EMAIL:
                return await this.executeSendEmail(action, execution);
            case ActionType.SEND_SMS:
                return await this.executeSendSMS(action, execution);
            case ActionType.CREATE_TASK:
                return await this.executeCreateTask(action, execution);
            case ActionType.UPDATE_RECORD:
                return await this.executeUpdateRecord(action, execution);
            case ActionType.CALL_WEBHOOK:
                return await this.executeCallWebhook(action, execution);
            case ActionType.DELAY:
                return await this.executeDelay(action, execution);
            default:
                throw new Error(`Unsupported action type: ${step.stepType}`);
        }
    }

    private async executeSendEmail(action: any, execution: IWorkflowExecution): Promise<any> {
        // Implementation for sending email
        return { status: 'email_sent', timestamp: new Date() };
    }

    private async executeSendSMS(action: any, execution: IWorkflowExecution): Promise<any> {
        // Implementation for sending SMS
        return { status: 'sms_sent', timestamp: new Date() };
    }

    private async executeCreateTask(action: any, execution: IWorkflowExecution): Promise<any> {
        // Implementation for creating task
        return { status: 'task_created', taskId: 'task_123', timestamp: new Date() };
    }

    private async executeUpdateRecord(action: any, execution: IWorkflowExecution): Promise<any> {
        // Implementation for updating record
        return { status: 'record_updated', recordId: action.config.recordId, timestamp: new Date() };
    }

    private async executeCallWebhook(action: any, execution: IWorkflowExecution): Promise<any> {
        // Implementation for calling webhook
        return { status: 'webhook_called', url: action.config.url, timestamp: new Date() };
    }

    private async executeDelay(action: any, execution: IWorkflowExecution): Promise<any> {
        // Implementation for delay
        const delayMs = this.calculateDelayMs(action.config.duration, action.config.unit);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return { status: 'delay_completed', duration: delayMs, timestamp: new Date() };
    }

    private calculateDelayMs(duration: number, unit: string): number {
        const multipliers = {
            seconds: 1000,
            minutes: 60 * 1000,
            hours: 60 * 60 * 1000,
            days: 24 * 60 * 60 * 1000
        };
        return duration * (multipliers[unit as keyof typeof multipliers] || 1000);
    }

    private generateExecutionSteps(actions: any[]): any[] {
        return actions.map((action, index) => ({
            stepId: `step_${index + 1}`,
            stepName: action.name || `Step ${index + 1}`,
            stepType: action.type,
            status: ExecutionStatus.PENDING,
            startedAt: new Date(),
            input: action.config,
            retryCount: 0,
            maxRetries: action.retryPolicy?.maxRetries || 3
        }));
    }

    private generateWorkflowId(): string {
        return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateExecutionId(): string {
        return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateRuleId(): string {
        return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateTemplateId(): string {
        return `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private countArrayItems(items: any[]): Record<string, number> {
        return items.reduce((acc, item) => {
            acc[item] = (acc[item] || 0) + 1;
            return acc;
        }, {});
    }
}