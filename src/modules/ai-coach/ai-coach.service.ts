import { AICoachModel } from './ai-coach.model';
import { v4 as uuidv4 } from 'uuid';
import aiService from '@shared/services/ai.service';
import { AIPromptService } from '@shared/services/ai-prompt.service';
import logger from '@shared/utils/logger.util';

export class AICoachService {
    // ─── Get AI-Powered Recommendations ────────────────────────
    async getRecommendations(data: any) {
        const { tenantId, studentId, performanceData, skillLevel, age, programs } = data;

        try {
            // Fetch previous coaching records for context
            const history = await AICoachModel.find({ studentId, tenantId })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();

            const prompt = AIPromptService.coachRecommendations({
                studentId,
                performanceData,
                skillLevel,
                history: history.map(h => h.recommendations),
                age,
                programs,
            });

            const aiResult = await aiService.jsonCompletion<{
                recommendations: Array<{
                    skill: string;
                    level: string;
                    suggestion: string;
                    priority: number;
                    estimatedTimeWeeks?: number;
                    drills?: string[];
                }>;
                overallAssessment: string;
                focusArea: string;
            }>({
                ...prompt,
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'ai-coach',
                temperature: 0.6,
            });

            // Save to database
            const record = await AICoachModel.create({
                coachingId: uuidv4(),
                tenantId,
                studentId,
                recommendations: aiResult.recommendations,
            });

            logger.info(`AI Coach: Generated ${aiResult.recommendations.length} recommendations for student ${studentId}`);

            return {
                studentId,
                recommendations: aiResult.recommendations,
                overallAssessment: aiResult.overallAssessment,
                focusArea: aiResult.focusArea,
                coachingId: record.coachingId,
                generatedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`AI Coach recommendations failed for student ${studentId}:`, error.message);
            // Fallback to basic recommendations
            return {
                studentId,
                recommendations: aiService.getFallbackData('ai-coach').recommendations,
                overallAssessment: 'AI analysis unavailable — showing default recommendations',
                focusArea: 'General fitness',
                generatedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── AI-Powered Performance Analysis ───────────────────────
    async analyzePerformance(data: any) {
        const { tenantId, studentId, performanceMetrics } = data;

        try {
            // Get previous analyses for trend comparison
            const previousAnalyses = await AICoachModel.find({
                studentId,
                tenantId,
                performanceAnalysis: { $exists: true, $ne: null },
            })
                .sort({ createdAt: -1 })
                .limit(3)
                .lean();

            const prompt = AIPromptService.coachPerformanceAnalysis({
                studentId,
                metrics: performanceMetrics,
                previousAnalyses: previousAnalyses.map(a => a.performanceAnalysis),
            });

            const analysis = await aiService.jsonCompletion<{
                overallScore: number;
                strengths: string[];
                areasForImprovement: string[];
                trend: string;
                detailedBreakdown: Record<string, any>;
                insights: string;
                nextMilestone: string;
            }>({
                ...prompt,
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'ai-coach',
                temperature: 0.5,
            });

            // Save analysis to DB
            await AICoachModel.create({
                coachingId: uuidv4(),
                tenantId,
                studentId,
                performanceAnalysis: analysis,
            });

            logger.info(`AI Coach: Performance analysis completed for student ${studentId} — Score: ${analysis.overallScore}`);

            return {
                studentId,
                ...analysis,
                analyzedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`AI Coach analysis failed for student ${studentId}:`, error.message);
            return {
                studentId,
                overallScore: 0,
                strengths: [],
                areasForImprovement: [],
                trend: 'unknown',
                detailedBreakdown: {},
                insights: 'AI analysis unavailable. Please try again later.',
                nextMilestone: 'N/A',
                analyzedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── AI-Generated Coaching Plan ────────────────────────────
    async getCoachingPlan(tenantId: string, studentId: string) {
        try {
            // Check for recent plan (within last 7 days)
            const recentPlan = await AICoachModel.findOne({
                studentId,
                tenantId,
                'coachingPlan.goals': { $exists: true, $ne: [] },
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            })
                .sort({ createdAt: -1 })
                .lean();

            if (recentPlan?.coachingPlan) {
                return {
                    studentId,
                    ...recentPlan.coachingPlan,
                    coachingId: recentPlan.coachingId,
                    createdAt: recentPlan.createdAt,
                    aiPowered: true,
                    cached: true,
                };
            }

            // Fetch previous analyses for plan context
            const previousAnalyses = await AICoachModel.find({
                studentId,
                tenantId,
                performanceAnalysis: { $exists: true },
            })
                .sort({ createdAt: -1 })
                .limit(3)
                .lean();

            const prompt = AIPromptService.coachingPlan({
                studentId,
                previousAnalyses: previousAnalyses.map(a => a.performanceAnalysis),
            });

            const plan = await aiService.jsonCompletion<{
                goals: string[];
                weeklyPlan: Array<{
                    week: number;
                    focus: string;
                    exercises: string[];
                    progressMetrics: string[];
                    coachNotes: string;
                }>;
                timeline: string;
                milestones: Array<{ week: number; milestone: string; criteria: string }>;
                safetyNotes: string[];
            }>({
                ...prompt,
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'ai-coach',
                temperature: 0.7,
                maxTokens: 3000,
            });

            // Save to DB
            const record = await AICoachModel.create({
                coachingId: uuidv4(),
                tenantId,
                studentId,
                coachingPlan: {
                    goals: plan.goals,
                    exercises: plan.weeklyPlan?.flatMap(w => w.exercises) || [],
                    timeline: plan.timeline,
                    progressMetrics: plan.weeklyPlan?.flatMap(w => w.progressMetrics) || [],
                },
            });

            logger.info(`AI Coach: Generated ${plan.timeline} coaching plan for student ${studentId}`);

            return {
                studentId,
                ...plan,
                coachingId: record.coachingId,
                createdAt: new Date(),
                aiPowered: true,
                cached: false,
            };
        } catch (error: any) {
            logger.error(`AI Coach plan generation failed for student ${studentId}:`, error.message);
            return {
                studentId,
                goals: ['Improve overall fitness'],
                weeklyPlan: [],
                timeline: '12 weeks',
                milestones: [],
                safetyNotes: ['Consult with coach before starting'],
                createdAt: new Date(),
                aiPowered: false,
            };
        }
    }
}
