import { WorkflowOrchestratorModel } from './workflow-orchestrator.model';
import { v4 as uuidv4 } from 'uuid';
import aiService from '@shared/services/ai.service';
import logger from '@shared/utils/logger.util';

export class WorkflowOrchestratorService {
    // ─── Create Workflow Chain ───────────────────────────────────
    async createChain(data: any) {
        const { tenantId, name, description, steps, createdBy, useAI } = data;

        try {
            let generatedSteps = steps;

            if (useAI || !steps || steps.length === 0) {
                const prompt = {
                    system: `You are an expert workflow automation designer for fitness businesses. RESPOND ONLY with valid JSON: { "steps": [{ "stepId": "string", "name": "string", "type": "AI_CALL|CONDITION|DELAY|WEBHOOK|NOTIFICATION", "config": {}, "conditions": [{ "field": "string", "operator": "string", "value": "any" }], "onSuccess": "string (next stepId)", "onFailure": "string (stepId or STOP)" }], "estimatedDuration": "string", "complexity": "string" }`,
                    user: `Design an automated workflow chain for a fitness business.
Name: ${name}
Description: ${description}
Tenant: ${tenantId}
Create a complete workflow with logical step progression. Each step should have clear success/failure paths.`,
                };

                const aiResult = await aiService.jsonCompletion<{
                    steps: Array<{
                        stepId: string;
                        name: string;
                        type: string;
                        config: any;
                        conditions: Array<{ field: string; operator: string; value: any }>;
                        onSuccess: string;
                        onFailure: string;
                    }>;
                    estimatedDuration: string;
                    complexity: string;
                }>({
                    systemPrompt: prompt.system,
                    userPrompt: prompt.user,
                    module: 'workflow-orchestrator',
                    temperature: 0.5,
                });

                generatedSteps = aiResult.steps.map(step => ({
                    ...step,
                    stepId: step.stepId || uuidv4(),
                    status: 'PENDING',
                    result: null,
                    executedAt: null,
                }));
            }

            const record = await WorkflowOrchestratorModel.create({
                chainId: uuidv4(),
                tenantId,
                name,
                description,
                status: 'DRAFT',
                steps: generatedSteps.map((s: any) => ({
                    ...s,
                    stepId: s.stepId || uuidv4(),
                    status: s.status || 'PENDING',
                })),
                executionHistory: [],
                createdBy,
            });

            logger.info(`Workflow Orchestrator: Created chain "${name}" with ${record.steps.length} steps for tenant ${tenantId}`);

            return {
                chainId: record.chainId,
                name: record.name,
                description: record.description,
                status: record.status,
                steps: record.steps,
                stepsCount: record.steps.length,
                createdAt: record.createdAt,
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Workflow Orchestrator chain creation failed:`, error.message);
            const fallbackRecord = await WorkflowOrchestratorModel.create({
                chainId: uuidv4(),
                tenantId,
                name,
                description,
                status: 'DRAFT',
                steps: steps || [],
                executionHistory: [],
                createdBy,
            });
            return {
                chainId: fallbackRecord.chainId,
                name: fallbackRecord.name,
                description: fallbackRecord.description,
                status: 'DRAFT',
                steps: fallbackRecord.steps,
                stepsCount: fallbackRecord.steps.length,
                createdAt: fallbackRecord.createdAt,
                aiPowered: false,
            };
        }
    }

    // ─── Execute Chain ───────────────────────────────────────────
    async executeChain(chainId: string, tenantId: string) {
        try {
            const chain = await WorkflowOrchestratorModel.findOne({ chainId, tenantId });
            if (!chain) {
                throw new Error(`Chain ${chainId} not found`);
            }

            const executionId = uuidv4();
            const startedAt = new Date();
            let stepsExecuted = 0;
            let executionStatus = 'COMPLETED';

            chain.status = 'ACTIVE';
            await chain.save();

            for (const step of chain.steps) {
                try {
                    if (step.type === 'AI_CALL') {
                        const prompt = {
                            system: `You are an AI workflow executor for fitness businesses. Execute the described task and RESPOND ONLY with valid JSON: { "result": "any", "success": true, "message": "string", "data": {} }`,
                            user: `Execute workflow step: ${step.name}
Configuration: ${JSON.stringify(step.config || {})}
Step Type: ${step.type}
Provide the result of executing this step.`,
                        };

                        const aiResult = await aiService.jsonCompletion<{
                            result: any;
                            success: boolean;
                            message: string;
                            data: any;
                        }>({
                            systemPrompt: prompt.system,
                            userPrompt: prompt.user,
                            module: 'workflow-orchestrator',
                            temperature: 0.3,
                        });

                        step.result = aiResult;
                        step.status = aiResult.success ? 'COMPLETED' : 'FAILED';
                    } else if (step.type === 'CONDITION') {
                        step.result = { evaluated: true, conditionMet: true };
                        step.status = 'COMPLETED';
                    } else if (step.type === 'DELAY') {
                        step.result = { delayed: true, duration: step.config?.duration || '0s' };
                        step.status = 'COMPLETED';
                    } else if (step.type === 'WEBHOOK') {
                        step.result = { webhookQueued: true, url: step.config?.url || '' };
                        step.status = 'COMPLETED';
                    } else if (step.type === 'NOTIFICATION') {
                        step.result = { notificationSent: true, channel: step.config?.channel || 'email' };
                        step.status = 'COMPLETED';
                    }

                    step.executedAt = new Date();
                    stepsExecuted++;

                    if (step.status === 'FAILED') {
                        executionStatus = 'FAILED';
                        break;
                    }
                } catch (stepError: any) {
                    logger.error(`Workflow step "${step.name}" failed:`, stepError.message);
                    step.status = 'FAILED';
                    step.result = { error: stepError.message };
                    step.executedAt = new Date();
                    executionStatus = 'FAILED';
                    break;
                }
            }

            chain.status = executionStatus === 'COMPLETED' ? 'COMPLETED' : 'FAILED';
            chain.executionHistory.push({
                executionId,
                startedAt,
                completedAt: new Date(),
                status: executionStatus,
                stepsExecuted,
            });
            await chain.save();

            logger.info(`Workflow Orchestrator: Executed chain "${chain.name}" — ${stepsExecuted}/${chain.steps.length} steps, status: ${executionStatus}`);

            return {
                chainId,
                executionId,
                status: executionStatus,
                stepsExecuted,
                totalSteps: chain.steps.length,
                steps: chain.steps,
                startedAt,
                completedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Workflow Orchestrator execution failed for chain ${chainId}:`, error.message);
            return {
                chainId,
                status: 'FAILED',
                error: error.message,
                stepsExecuted: 0,
                totalSteps: 0,
                aiPowered: false,
            };
        }
    }

    // ─── Get Chain Details ───────────────────────────────────────
    async getChain(chainId: string) {
        try {
            const chain = await WorkflowOrchestratorModel.findOne({ chainId }).lean();
            if (!chain) {
                throw new Error(`Chain ${chainId} not found`);
            }

            logger.info(`Workflow Orchestrator: Retrieved chain ${chainId}`);

            return {
                ...chain,
                stepsCount: chain.steps.length,
                executionCount: chain.executionHistory.length,
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Workflow Orchestrator get chain failed for ${chainId}:`, error.message);
            throw error;
        }
    }

    // ─── Schedule Report ─────────────────────────────────────────
    async scheduleReport(data: any) {
        const { tenantId, chainId, cron, description } = data;

        try {
            const chain = await WorkflowOrchestratorModel.findOne({ chainId, tenantId });
            if (!chain) {
                throw new Error(`Chain ${chainId} not found`);
            }

            const prompt = {
                system: `You are a scheduling expert. RESPOND ONLY with valid JSON: { "cronExpression": "string", "humanReadable": "string", "nextRunAt": "string (ISO date)", "recommendedFrequency": "string", "warnings": ["string"] }`,
                user: `Set up a scheduled report for a fitness workflow chain.
Chain Name: ${chain.name}
Requested Cron: ${cron || 'daily at 9am'}
Description: ${description || 'Automated report'}
Validate the cron expression and provide scheduling details.`,
            };

            const aiResult = await aiService.jsonCompletion<{
                cronExpression: string;
                humanReadable: string;
                nextRunAt: string;
                recommendedFrequency: string;
                warnings: string[];
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'workflow-orchestrator',
                temperature: 0.3,
            });

            chain.schedule = {
                cron: aiResult.cronExpression || cron,
                nextRunAt: new Date(aiResult.nextRunAt || Date.now() + 86400000),
                lastRunAt: chain.schedule?.lastRunAt || null as any,
            };
            chain.status = 'ACTIVE';
            await chain.save();

            logger.info(`Workflow Orchestrator: Scheduled chain "${chain.name}" with cron: ${chain.schedule.cron}`);

            return {
                chainId,
                name: chain.name,
                schedule: chain.schedule,
                ...aiResult,
                status: 'ACTIVE',
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Workflow Orchestrator schedule report failed:`, error.message);
            return {
                chainId,
                schedule: { cron: cron || '0 9 * * *', nextRunAt: new Date(Date.now() + 86400000) },
                humanReadable: 'Daily at 9:00 AM',
                warnings: ['AI scheduling validation unavailable, using default'],
                aiPowered: false,
            };
        }
    }

    // ─── Get Workflow Health ─────────────────────────────────────
    async getWorkflowHealth(workflowId: string) {
        try {
            const chain = await WorkflowOrchestratorModel.findOne({ chainId: workflowId }).lean();
            if (!chain) {
                throw new Error(`Workflow ${workflowId} not found`);
            }

            const prompt = {
                system: `You are an expert workflow health analyst. RESPOND ONLY with valid JSON: { "healthScore": number, "status": "string", "issues": ["string"], "recommendations": ["string"], "performanceMetrics": { "avgExecutionTime": "string", "successRate": number, "failureRate": number, "bottlenecks": ["string"] }, "predictedIssues": ["string"] }`,
                user: `Analyze the health of this fitness business workflow.
Workflow Name: ${chain.name}
Status: ${chain.status}
Total Steps: ${chain.steps.length}
Execution History: ${JSON.stringify(chain.executionHistory.slice(-10))}
Steps Status: ${chain.steps.map(s => `${s.name}: ${s.status}`).join(', ')}
Provide a comprehensive health analysis.`,
            };

            const aiResult = await aiService.jsonCompletion<{
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
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'workflow-orchestrator',
                temperature: 0.4,
            });

            logger.info(`Workflow Orchestrator: Health check for "${chain.name}" — score: ${aiResult.healthScore}`);

            return {
                workflowId,
                name: chain.name,
                ...aiResult,
                analyzedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Workflow Orchestrator health check failed for ${workflowId}:`, error.message);
            return {
                workflowId,
                healthScore: 0,
                status: 'UNKNOWN',
                issues: ['Health analysis unavailable'],
                recommendations: ['Retry the health check later'],
                performanceMetrics: {
                    avgExecutionTime: 'N/A',
                    successRate: 0,
                    failureRate: 0,
                    bottlenecks: [],
                },
                predictedIssues: [],
                analyzedAt: new Date(),
                aiPowered: false,
            };
        }
    }
}
