import { Schema, model, Document } from 'mongoose';

export interface IWorkflowOrchestratorDocument extends Document {
    chainId: string;
    tenantId: string;
    name: string;
    description: string;
    status: string;
    steps: Array<{
        stepId: string;
        name: string;
        type: string;
        config: any;
        conditions: Array<{ field: string; operator: string; value: any }>;
        onSuccess: string;
        onFailure: string;
        result: any;
        status: string;
        executedAt: Date;
    }>;
    schedule: {
        cron: string;
        nextRunAt: Date;
        lastRunAt: Date;
    };
    executionHistory: Array<{
        executionId: string;
        startedAt: Date;
        completedAt: Date;
        status: string;
        stepsExecuted: number;
    }>;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

const workflowOrchestratorSchema = new Schema<IWorkflowOrchestratorDocument>(
    {
        chainId: { type: String, required: true, unique: true },
        tenantId: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String },
        status: {
            type: String,
            enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'FAILED'],
            default: 'DRAFT',
        },
        steps: [
            {
                stepId: { type: String },
                name: { type: String },
                type: {
                    type: String,
                    enum: ['AI_CALL', 'CONDITION', 'DELAY', 'WEBHOOK', 'NOTIFICATION'],
                },
                config: { type: Schema.Types.Mixed },
                conditions: [
                    {
                        field: { type: String },
                        operator: { type: String },
                        value: { type: Schema.Types.Mixed },
                    },
                ],
                onSuccess: { type: String },
                onFailure: { type: String },
                result: { type: Schema.Types.Mixed },
                status: { type: String },
                executedAt: { type: Date },
            },
        ],
        schedule: {
            cron: { type: String },
            nextRunAt: { type: Date },
            lastRunAt: { type: Date },
        },
        executionHistory: [
            {
                executionId: { type: String },
                startedAt: { type: Date },
                completedAt: { type: Date },
                status: { type: String },
                stepsExecuted: { type: Number },
            },
        ],
        createdBy: { type: String },
    },
    { timestamps: true }
);

export const WorkflowOrchestratorModel = model<IWorkflowOrchestratorDocument>('WorkflowOrchestrator', workflowOrchestratorSchema);
