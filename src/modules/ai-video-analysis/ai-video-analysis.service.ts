import { AIVideoAnalysisModel } from './ai-video-analysis.model';
import { v4 as uuidv4 } from 'uuid';
import aiService from '@shared/services/ai.service';
import { AIPromptService } from '@shared/services/ai-prompt.service';
import logger from '@shared/utils/logger.util';

export class AIVideoAnalysisService {
    // ─── Analyze Video for Exercise Form ─────────────────────────
    async analyzeVideo(data: any) {
        const { tenantId, studentId, exerciseType, videoUrl, description } = data;

        try {
            const history = await AIVideoAnalysisModel.find({ studentId, tenantId })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();

            const prompt = {
                system: `You are an expert sports biomechanics and exercise form analyst AI. Analyze the described exercise video and provide detailed form assessment. RESPOND ONLY with valid JSON matching this schema: { "formScore": number (0-100), "analysis": { "posture": string, "alignment": string, "movement": string, "issues": [string], "overallAssessment": string, "safetyRisk": "low" | "medium" | "high" }, "injuryRisk": { "riskLevel": "low" | "medium" | "high", "riskFactors": [string], "recommendations": [string] } }`,
                user: `Exercise type: ${exerciseType}\nVideo URL: ${videoUrl}\nDescription: ${description}\nStudent ID: ${studentId}\nPrevious analyses count: ${history.length}\nPrevious form scores: ${history.map(h => h.formScore).join(', ') || 'None'}\nPrevious issues: ${history.flatMap(h => h.analysis?.issues || []).join(', ') || 'None'}`,
            };

            const aiResult = await aiService.jsonCompletion<{
                formScore: number;
                analysis: {
                    posture: string;
                    alignment: string;
                    movement: string;
                    issues: string[];
                    overallAssessment: string;
                    safetyRisk: string;
                };
                injuryRisk: {
                    riskLevel: string;
                    riskFactors: string[];
                    recommendations: string[];
                };
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'ai-video-analysis',
                temperature: 0.5,
            });

            const record = await AIVideoAnalysisModel.create({
                analysisId: uuidv4(),
                tenantId,
                studentId,
                videoUrl,
                exerciseType,
                formScore: aiResult.formScore,
                analysis: aiResult.analysis,
                injuryRisk: aiResult.injuryRisk,
            });

            logger.info(`AI Video Analysis: Form score ${aiResult.formScore} for student ${studentId}, exercise ${exerciseType}`);

            return {
                analysisId: record.analysisId,
                studentId,
                exerciseType,
                formScore: aiResult.formScore,
                analysis: aiResult.analysis,
                injuryRisk: aiResult.injuryRisk,
                analyzedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`AI Video Analysis failed for student ${studentId}:`, error.message);
            return {
                studentId,
                exerciseType,
                formScore: 0,
                analysis: {
                    posture: 'Analysis unavailable',
                    alignment: 'Analysis unavailable',
                    movement: 'Analysis unavailable',
                    issues: [],
                    overallAssessment: 'AI analysis unavailable. Please try again later.',
                    safetyRisk: 'unknown',
                },
                injuryRisk: {
                    riskLevel: 'unknown',
                    riskFactors: [],
                    recommendations: ['Consult with a coach for manual assessment'],
                },
                analyzedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Get Analysis by ID ──────────────────────────────────────
    async getAnalysis(analysisId: string) {
        try {
            const analysis = await AIVideoAnalysisModel.findOne({ analysisId }).lean();
            if (!analysis) {
                throw new Error(`Analysis not found: ${analysisId}`);
            }
            return { ...analysis, aiPowered: true };
        } catch (error: any) {
            logger.error(`Get analysis failed for ${analysisId}:`, error.message);
            throw error;
        }
    }

    // ─── Get Student Analysis History ────────────────────────────
    async getStudentHistory(studentId: string, tenantId: string, page: number = 1, limit: number = 20) {
        try {
            const skip = (page - 1) * limit;
            const [records, total] = await Promise.all([
                AIVideoAnalysisModel.find({ studentId, tenantId })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                AIVideoAnalysisModel.countDocuments({ studentId, tenantId }),
            ]);

            return {
                studentId,
                records,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Get student history failed for ${studentId}:`, error.message);
            throw error;
        }
    }

    // ─── Compare Two Analyses ────────────────────────────────────
    async compareAnalyses(data: any) {
        const { tenantId, analysisId1, analysisId2 } = data;

        try {
            const [analysis1, analysis2] = await Promise.all([
                AIVideoAnalysisModel.findOne({ analysisId: analysisId1, tenantId }).lean(),
                AIVideoAnalysisModel.findOne({ analysisId: analysisId2, tenantId }).lean(),
            ]);

            if (!analysis1 || !analysis2) {
                throw new Error('One or both analyses not found');
            }

            const prompt = {
                system: `You are an expert sports biomechanics analyst comparing two exercise form analyses over time. RESPOND ONLY with valid JSON matching this schema: { "improvementAreas": [string], "regressionAreas": [string], "overallTrend": "improving" | "stable" | "declining", "scoreDifference": number, "detailedComparison": string, "actionItems": [string] }`,
                user: `Analysis 1 (older):\n- Exercise: ${analysis1.exerciseType}\n- Form Score: ${analysis1.formScore}\n- Posture: ${analysis1.analysis?.posture}\n- Alignment: ${analysis1.analysis?.alignment}\n- Movement: ${analysis1.analysis?.movement}\n- Issues: ${(analysis1.analysis?.issues || []).join(', ')}\n- Date: ${analysis1.createdAt}\n\nAnalysis 2 (newer):\n- Exercise: ${analysis2.exerciseType}\n- Form Score: ${analysis2.formScore}\n- Posture: ${analysis2.analysis?.posture}\n- Alignment: ${analysis2.analysis?.alignment}\n- Movement: ${analysis2.analysis?.movement}\n- Issues: ${(analysis2.analysis?.issues || []).join(', ')}\n- Date: ${analysis2.createdAt}`,
            };

            const aiResult = await aiService.jsonCompletion<{
                improvementAreas: string[];
                regressionAreas: string[];
                overallTrend: string;
                scoreDifference: number;
                detailedComparison: string;
                actionItems: string[];
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'ai-video-analysis',
                temperature: 0.5,
            });

            // Update the newer analysis with comparison data
            await AIVideoAnalysisModel.updateOne(
                { analysisId: analysisId2 },
                {
                    $set: {
                        comparison: {
                            previousAnalysisId: analysisId1,
                            improvementAreas: aiResult.improvementAreas,
                            regressionAreas: aiResult.regressionAreas,
                            overallTrend: aiResult.overallTrend,
                        },
                    },
                }
            );

            logger.info(`AI Video Analysis: Compared ${analysisId1} vs ${analysisId2}, trend: ${aiResult.overallTrend}`);

            return {
                analysisId1,
                analysisId2,
                ...aiResult,
                comparedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Compare analyses failed:`, error.message);
            return {
                analysisId1,
                analysisId2,
                improvementAreas: [],
                regressionAreas: [],
                overallTrend: 'unknown',
                scoreDifference: 0,
                detailedComparison: 'AI comparison unavailable. Please try again later.',
                actionItems: [],
                comparedAt: new Date(),
                aiPowered: false,
            };
        }
    }
}
