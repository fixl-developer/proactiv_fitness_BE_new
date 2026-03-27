import { AICoachAssistantModel } from './ai-coach-assistant.model';
import { v4 as uuidv4 } from 'uuid';
import aiService from '@shared/services/ai.service';
import { AIPromptService } from '@shared/services/ai-prompt.service';
import logger from '@shared/utils/logger.util';

export class AICoachAssistantService {
    // ─── Analyze Exercise Form (AI-Powered) ────────────────────
    async analyzeForm(data: {
        tenantId: string;
        studentId: string;
        videoUrl?: string;
        exerciseType: string;
        description?: string;
        age?: number;
        level?: string;
    }): Promise<any> {
        try {
            const prompt = AIPromptService.formAnalysis({
                exerciseType: data.exerciseType,
                studentId: data.studentId,
                description: data.description,
                videoUrl: data.videoUrl,
                age: data.age,
                level: data.level,
            });

            const analysis = await aiService.jsonCompletion<{
                posture: string;
                alignment: string;
                movement: string;
                issues: string[];
                overallAssessment: string;
                safetyRisk: string;
                immediateCorrections: string[];
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'ai-coach-assistant',
                temperature: 0.5,
            });

            // Save analysis to DB
            const record = await AICoachAssistantModel.create({
                assistantId: uuidv4(),
                tenantId: data.tenantId,
                studentId: data.studentId,
                videoUrl: data.videoUrl || 'none',
                exerciseType: data.exerciseType,
                formAnalysis: {
                    posture: analysis.posture,
                    alignment: analysis.alignment,
                    movement: analysis.movement,
                    issues: analysis.issues,
                },
            });

            logger.info(`AI Coach Assistant: Form analysis completed for student ${data.studentId} — Exercise: ${data.exerciseType}`);

            return {
                assistantId: record.assistantId,
                studentId: data.studentId,
                exerciseType: data.exerciseType,
                formAnalysis: analysis,
                analyzedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`AI Coach Assistant form analysis failed:`, error.message);
            const fallback = aiService.getFallbackData('ai-coach-assistant');
            return {
                studentId: data.studentId,
                exerciseType: data.exerciseType,
                formAnalysis: fallback,
                analyzedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Get Form Corrections (AI-Powered) ─────────────────────
    async getCorrections(tenantId: string, studentId: string): Promise<any> {
        try {
            // Fetch latest analysis for this student
            const latestAnalysis = await AICoachAssistantModel.findOne({
                studentId,
                tenantId,
            })
                .sort({ createdAt: -1 })
                .lean();

            if (!latestAnalysis) {
                return {
                    studentId,
                    corrections: [],
                    message: 'No form analysis found. Please submit a form analysis first.',
                    aiPowered: false,
                };
            }

            const prompt = AIPromptService.formCorrections({
                studentId,
                analysisData: latestAnalysis.formAnalysis,
                exerciseType: latestAnalysis.exerciseType,
            });

            const result = await aiService.jsonCompletion<{
                corrections: Array<{
                    issue: string;
                    correction: string;
                    priority: string;
                    drillRecommendation: string;
                    expectedImprovement: string;
                }>;
                warmupRoutine: string[];
                progressionPlan: string;
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'ai-coach-assistant',
                temperature: 0.5,
            });

            // Update the DB record with corrections
            await AICoachAssistantModel.findByIdAndUpdate(latestAnalysis._id, {
                corrections: result.corrections.map(c => ({
                    issue: c.issue,
                    correction: c.correction,
                    priority: c.priority,
                })),
            });

            logger.info(`AI Coach Assistant: Generated ${result.corrections.length} corrections for student ${studentId}`);

            return {
                studentId,
                ...result,
                basedOnAnalysis: latestAnalysis.assistantId,
                generatedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`AI Coach Assistant corrections failed for student ${studentId}:`, error.message);
            return {
                studentId,
                corrections: [],
                warmupRoutine: [],
                progressionPlan: 'Unable to generate — please try again later.',
                generatedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Get AI Recommendations ────────────────────────────────
    async getRecommendations(userId: string, data: any): Promise<any> {
        try {
            const prompt = AIPromptService.formAnalysis({
                exerciseType: data.exerciseType || 'general',
                studentId: userId,
                description: data.description,
            });

            const result = await aiService.jsonCompletion({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'ai-coach-assistant',
                temperature: 0.6,
            });

            return { success: true, data: { recommendations: result, userId }, aiPowered: true };
        } catch (error: any) {
            logger.error(`AI Coach Assistant recommendations failed:`, error.message);
            return { success: true, data: { recommendations: [], userId }, aiPowered: false };
        }
    }

    // ─── Start Interactive Coaching Session ─────────────────────
    async startSession(userId: string, data: any): Promise<any> {
        const sessionId = uuidv4();

        return {
            success: true,
            data: {
                sessionId,
                userId,
                message: 'AI coaching session started. Describe your exercise or ask for form guidance!',
                startedAt: new Date(),
            },
            aiPowered: true,
        };
    }

    // ─── Send Message in Coaching Session ───────────────────────
    async sendMessage(sessionId: string, message: string): Promise<any> {
        try {
            const prompt = AIPromptService.coachingSession({ message });

            const result = await aiService.jsonCompletion<{
                response: string;
                exerciseTips: string[];
                nextAction: string;
                encouragement: string;
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'ai-coach-assistant',
                temperature: 0.7,
            });

            return {
                success: true,
                data: {
                    ...result,
                    sessionId,
                },
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`AI Coach Assistant session message failed:`, error.message);
            return {
                success: true,
                data: {
                    response: 'I apologize, but I am unable to process your request right now. Please try again.',
                    sessionId,
                },
                aiPowered: false,
            };
        }
    }

    // ─── Get Session History ───────────────────────────────────
    async getSessionHistory(userId: string): Promise<any> {
        const sessions = await AICoachAssistantModel.find({ studentId: userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        return { success: true, data: sessions };
    }
}
