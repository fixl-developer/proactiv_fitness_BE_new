export class CreateChainDTO {
    tenantId: string;
    name: string;
    description?: string;
    steps?: Array<{
        stepId?: string;
        name: string;
        type: string;
        config?: any;
        conditions?: Array<{ field: string; operator: string; value: any }>;
        onSuccess?: string;
        onFailure?: string;
    }>;
    createdBy?: string;
    useAI?: boolean;
}

export class ExecuteChainDTO {
    chainId: string;
    tenantId: string;
}

export class ScheduleReportDTO {
    tenantId: string;
    chainId: string;
    cron?: string;
    description?: string;
}

export class ChainResponseDTO {
    chainId: string;
    name: string;
    description: string;
    status: string;
    steps: Array<{
        stepId: string;
        name: string;
        type: string;
        status: string;
        executedAt: Date;
    }>;
    stepsCount: number;
    createdAt: Date;
    aiPowered: boolean;
}

export class ExecutionResponseDTO {
    chainId: string;
    executionId: string;
    status: string;
    stepsExecuted: number;
    totalSteps: number;
    startedAt: Date;
    completedAt: Date;
    aiPowered: boolean;
}

export class WorkflowHealthResponseDTO {
    workflowId: string;
    name: string;
    healthScore: number;
    status: string;
    issues: string[];
    recommendations: string[];
    performanceMetrics: {
        avgExecutionTime: string;
        successRate: number;
        failureRate: number;
        bottlenecks: string[];
    };
    predictedIssues: string[];
    analyzedAt: Date;
    aiPowered: boolean;
}
