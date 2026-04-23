import { RevenueIntelligenceModel } from './revenue-intelligence.model';
import { v4 as uuidv4 } from 'uuid';
import aiService from '@shared/services/ai.service';
import { AIPromptService } from '@shared/services/ai-prompt.service';
import logger from '@shared/utils/logger.util';

export class RevenueIntelligenceService {
    // ─── Get Churn Risk ──────────────────────────────────────────
    async getChurnRisk(entityId: string, tenantId: string) {
        try {
            const previousPredictions = await RevenueIntelligenceModel.find({
                tenantId,
                type: 'CHURN_PREDICTION',
                entityId,
            })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();

            const prompt = {
                system: `You are an AI churn prediction specialist for fitness academies. Analyze member behavior patterns and predict churn risk with actionable retention strategies. RESPOND ONLY with valid JSON matching this schema: { "riskScore": number (0-100), "riskLevel": "low" | "medium" | "high" | "critical", "factors": [{ "factor": string, "impact": number (0-100), "description": string }], "retentionActions": [string], "urgency": string, "estimatedChurnDate": string }`,
                user: `Entity ID (student/member): ${entityId}\nTenant: ${tenantId}\nPrevious churn predictions: ${JSON.stringify(previousPredictions.map(p => ({ riskScore: p.churnPrediction?.riskScore, riskLevel: p.churnPrediction?.riskLevel, date: p.createdAt })))}`,
            };

            const aiResult = await aiService.jsonCompletion<{
                riskScore: number;
                riskLevel: string;
                factors: Array<{
                    factor: string;
                    impact: number;
                    description: string;
                }>;
                retentionActions: string[];
                urgency: string;
                estimatedChurnDate: string;
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'revenue-intelligence',
                temperature: 0.5,
            });

            const record = await RevenueIntelligenceModel.create({
                analysisId: uuidv4(),
                tenantId,
                type: 'CHURN_PREDICTION',
                entityId,
                churnPrediction: {
                    riskScore: aiResult.riskScore,
                    riskLevel: aiResult.riskLevel,
                    factors: aiResult.factors,
                    retentionActions: aiResult.retentionActions,
                },
            });

            logger.info(`Revenue Intelligence: Churn risk for ${entityId} — score ${aiResult.riskScore}, level ${aiResult.riskLevel}`);

            return {
                analysisId: record.analysisId,
                entityId,
                riskScore: aiResult.riskScore,
                riskLevel: aiResult.riskLevel,
                factors: aiResult.factors,
                retentionActions: aiResult.retentionActions,
                urgency: aiResult.urgency,
                estimatedChurnDate: aiResult.estimatedChurnDate,
                analyzedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Revenue Intelligence churn prediction failed for ${entityId}:`, error.message);
            return {
                entityId,
                riskScore: 0,
                riskLevel: 'unknown',
                factors: [],
                retentionActions: ['Unable to analyze churn risk. Review member activity manually.'],
                urgency: 'unknown',
                estimatedChurnDate: '',
                analyzedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Trigger Retention Campaign ──────────────────────────────
    async triggerRetentionCampaign(data: any) {
        const { tenantId, targetSegment, budget, goals } = data;

        try {
            const previousCampaigns = await RevenueIntelligenceModel.find({
                tenantId,
                type: 'RETENTION_CAMPAIGN',
            })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();

            const churnData = await RevenueIntelligenceModel.find({
                tenantId,
                type: 'CHURN_PREDICTION',
                'churnPrediction.riskLevel': { $in: ['high', 'critical'] },
            })
                .sort({ createdAt: -1 })
                .limit(20)
                .lean();

            const prompt = {
                system: `You are an AI retention marketing specialist for fitness academies. Design a targeted retention campaign that addresses churn risks and maximizes member retention. RESPOND ONLY with valid JSON matching this schema: { "campaignName": string, "targetSegment": string, "channels": [string], "messageTemplate": string, "expectedImpact": { "retentionImprovement": number (percentage), "revenueProtected": number }, "timeline": string, "kpis": [string], "abTestVariants": [{ "variant": string, "description": string }] }`,
                user: `Tenant: ${tenantId}\nTarget segment: ${targetSegment}\nBudget: ${budget}\nGoals: ${JSON.stringify(goals)}\nHigh-risk churn members: ${churnData.length}\nPrevious campaigns: ${JSON.stringify(previousCampaigns.map(c => ({ name: c.retentionCampaign?.campaignName, impact: c.retentionCampaign?.expectedImpact })))}`,
            };

            const aiResult = await aiService.jsonCompletion<{
                campaignName: string;
                targetSegment: string;
                channels: string[];
                messageTemplate: string;
                expectedImpact: {
                    retentionImprovement: number;
                    revenueProtected: number;
                };
                timeline: string;
                kpis: string[];
                abTestVariants: Array<{
                    variant: string;
                    description: string;
                }>;
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'revenue-intelligence',
                temperature: 0.5,
            });

            const record = await RevenueIntelligenceModel.create({
                analysisId: uuidv4(),
                tenantId,
                type: 'RETENTION_CAMPAIGN',
                retentionCampaign: {
                    campaignName: aiResult.campaignName,
                    targetSegment: aiResult.targetSegment,
                    channels: aiResult.channels,
                    messageTemplate: aiResult.messageTemplate,
                    expectedImpact: aiResult.expectedImpact,
                },
            });

            logger.info(`Revenue Intelligence: Retention campaign "${aiResult.campaignName}" created for tenant ${tenantId}`);

            return {
                analysisId: record.analysisId,
                campaignName: aiResult.campaignName,
                targetSegment: aiResult.targetSegment,
                channels: aiResult.channels,
                messageTemplate: aiResult.messageTemplate,
                expectedImpact: aiResult.expectedImpact,
                timeline: aiResult.timeline,
                kpis: aiResult.kpis,
                abTestVariants: aiResult.abTestVariants,
                createdAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Revenue Intelligence retention campaign failed for tenant ${tenantId}:`, error.message);
            return {
                campaignName: '',
                targetSegment: targetSegment || '',
                channels: [],
                messageTemplate: '',
                expectedImpact: { retentionImprovement: 0, revenueProtected: 0 },
                timeline: '',
                kpis: [],
                abTestVariants: [],
                createdAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Get Upsell Opportunities ────────────────────────────────
    async getUpsellOpportunities(tenantId: string) {
        try {
            const existingUpsells = await RevenueIntelligenceModel.find({
                tenantId,
                type: 'UPSELL',
            })
                .sort({ createdAt: -1 })
                .limit(20)
                .lean();

            const prompt = {
                system: `You are an AI revenue growth specialist for fitness academies. Identify upsell opportunities based on member behavior, usage patterns, and program fit. RESPOND ONLY with valid JSON matching this schema: { "opportunities": [{ "studentId": string, "suggestedPrograms": [string], "estimatedRevenue": number, "confidence": number (0-1), "reasoning": string, "approach": string }], "totalEstimatedRevenue": number, "topOpportunities": number, "insights": string }`,
                user: `Tenant: ${tenantId}\nExisting upsell records: ${existingUpsells.length}\nRecent upsell data: ${JSON.stringify(existingUpsells.slice(0, 5).map(u => ({ studentId: u.upsellOpportunity?.studentId, programs: u.upsellOpportunity?.suggestedPrograms, revenue: u.upsellOpportunity?.estimatedRevenue })))}`,
            };

            const aiResult = await aiService.jsonCompletion<{
                opportunities: Array<{
                    studentId: string;
                    suggestedPrograms: string[];
                    estimatedRevenue: number;
                    confidence: number;
                    reasoning: string;
                    approach: string;
                }>;
                totalEstimatedRevenue: number;
                topOpportunities: number;
                insights: string;
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'revenue-intelligence',
                temperature: 0.5,
            });

            // Save each opportunity
            for (const opp of aiResult.opportunities) {
                await RevenueIntelligenceModel.create({
                    analysisId: uuidv4(),
                    tenantId,
                    type: 'UPSELL',
                    entityId: opp.studentId,
                    upsellOpportunity: {
                        studentId: opp.studentId,
                        suggestedPrograms: opp.suggestedPrograms,
                        estimatedRevenue: opp.estimatedRevenue,
                        confidence: opp.confidence,
                        reasoning: opp.reasoning,
                    },
                });
            }

            logger.info(`Revenue Intelligence: Found ${aiResult.opportunities.length} upsell opportunities for tenant ${tenantId}, est. revenue $${aiResult.totalEstimatedRevenue}`);

            return {
                tenantId,
                opportunities: aiResult.opportunities,
                totalEstimatedRevenue: aiResult.totalEstimatedRevenue,
                topOpportunities: aiResult.topOpportunities,
                insights: aiResult.insights,
                analyzedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Revenue Intelligence upsell analysis failed for tenant ${tenantId}:`, error.message);
            return {
                tenantId,
                opportunities: [],
                totalEstimatedRevenue: 0,
                topOpportunities: 0,
                insights: 'AI upsell analysis unavailable. Please try again later.',
                analyzedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Predict Lifetime Value ──────────────────────────────────
    async predictLTV(studentId: string, tenantId: string) {
        try {
            const previousLTV = await RevenueIntelligenceModel.findOne({
                tenantId,
                type: 'LTV',
                entityId: studentId,
            })
                .sort({ createdAt: -1 })
                .lean();

            const churnData = await RevenueIntelligenceModel.findOne({
                tenantId,
                type: 'CHURN_PREDICTION',
                entityId: studentId,
            })
                .sort({ createdAt: -1 })
                .lean();

            const prompt = {
                system: `You are an AI lifetime value prediction specialist for fitness academies. Predict the lifetime value of a student/member based on their engagement, spending patterns, and retention signals. RESPOND ONLY with valid JSON matching this schema: { "predictedLtv": number, "currentSpend": number, "projectedMonths": number, "confidence": number (0-1), "factors": [string], "segment": string, "growthPotential": string, "recommendedActions": [string] }`,
                user: `Student ID: ${studentId}\nTenant: ${tenantId}\nPrevious LTV prediction: ${previousLTV ? JSON.stringify({ ltv: previousLTV.ltv?.predictedLtv, confidence: previousLTV.ltv?.confidence, date: previousLTV.createdAt }) : 'None'}\nChurn risk: ${churnData ? JSON.stringify({ riskScore: churnData.churnPrediction?.riskScore, riskLevel: churnData.churnPrediction?.riskLevel }) : 'No churn data'}`,
            };

            const aiResult = await aiService.jsonCompletion<{
                predictedLtv: number;
                currentSpend: number;
                projectedMonths: number;
                confidence: number;
                factors: string[];
                segment: string;
                growthPotential: string;
                recommendedActions: string[];
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'revenue-intelligence',
                temperature: 0.5,
            });

            const record = await RevenueIntelligenceModel.create({
                analysisId: uuidv4(),
                tenantId,
                type: 'LTV',
                entityId: studentId,
                ltv: {
                    predictedLtv: aiResult.predictedLtv,
                    currentSpend: aiResult.currentSpend,
                    projectedMonths: aiResult.projectedMonths,
                    confidence: aiResult.confidence,
                    factors: aiResult.factors,
                },
            });

            logger.info(`Revenue Intelligence: LTV prediction for student ${studentId} — $${aiResult.predictedLtv} over ${aiResult.projectedMonths} months`);

            return {
                analysisId: record.analysisId,
                studentId,
                predictedLtv: aiResult.predictedLtv,
                currentSpend: aiResult.currentSpend,
                projectedMonths: aiResult.projectedMonths,
                confidence: aiResult.confidence,
                factors: aiResult.factors,
                segment: aiResult.segment,
                growthPotential: aiResult.growthPotential,
                recommendedActions: aiResult.recommendedActions,
                predictedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Revenue Intelligence LTV prediction failed for student ${studentId}:`, error.message);
            return {
                studentId,
                predictedLtv: 0,
                currentSpend: 0,
                projectedMonths: 0,
                confidence: 0,
                factors: [],
                segment: 'unknown',
                growthPotential: 'unknown',
                recommendedActions: ['Unable to predict LTV. Gather more member data.'],
                predictedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Get Revenue Optimization Suggestions ────────────────────
    async getOptimizationSuggestions(tenantId: string) {
        try {
            const churnData = await RevenueIntelligenceModel.find({
                tenantId,
                type: 'CHURN_PREDICTION',
            })
                .sort({ createdAt: -1 })
                .limit(50)
                .lean();

            const upsellData = await RevenueIntelligenceModel.find({
                tenantId,
                type: 'UPSELL',
            })
                .sort({ createdAt: -1 })
                .limit(20)
                .lean();

            const ltvData = await RevenueIntelligenceModel.find({
                tenantId,
                type: 'LTV',
            })
                .sort({ createdAt: -1 })
                .limit(20)
                .lean();

            const prompt = {
                system: `You are an AI revenue optimization consultant for fitness academies. Analyze all available revenue data and provide actionable optimization suggestions ranked by expected impact. RESPOND ONLY with valid JSON matching this schema: { "suggestions": [{ "area": string, "suggestion": string, "expectedImpact": number (estimated revenue impact in dollars), "priority": number (1-10), "effort": "low" | "medium" | "high", "timeframe": string }], "overallHealthScore": number (0-100), "topPriority": string, "quickWins": [string], "longTermStrategies": [string] }`,
                user: `Tenant: ${tenantId}\nChurn data summary: ${churnData.length} predictions, avg risk score ${churnData.reduce((acc, c) => acc + (c.churnPrediction?.riskScore || 0), 0) / (churnData.length || 1)}\nUpsell opportunities: ${upsellData.length} identified, total est. revenue $${upsellData.reduce((acc, u) => acc + (u.upsellOpportunity?.estimatedRevenue || 0), 0)}\nLTV data: ${ltvData.length} predictions, avg LTV $${ltvData.reduce((acc, l) => acc + (l.ltv?.predictedLtv || 0), 0) / (ltvData.length || 1)}`,
            };

            const aiResult = await aiService.jsonCompletion<{
                suggestions: Array<{
                    area: string;
                    suggestion: string;
                    expectedImpact: number;
                    priority: number;
                    effort: string;
                    timeframe: string;
                }>;
                overallHealthScore: number;
                topPriority: string;
                quickWins: string[];
                longTermStrategies: string[];
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'revenue-intelligence',
                temperature: 0.5,
            });

            const record = await RevenueIntelligenceModel.create({
                analysisId: uuidv4(),
                tenantId,
                type: 'OPTIMIZATION',
                optimizationSuggestions: {
                    suggestions: aiResult.suggestions.map(s => ({
                        area: s.area,
                        suggestion: s.suggestion,
                        expectedImpact: s.expectedImpact,
                        priority: s.priority,
                    })),
                },
            });

            logger.info(`Revenue Intelligence: Generated ${aiResult.suggestions.length} optimization suggestions for tenant ${tenantId}, health score ${aiResult.overallHealthScore}`);

            return {
                analysisId: record.analysisId,
                tenantId,
                suggestions: aiResult.suggestions,
                overallHealthScore: aiResult.overallHealthScore,
                topPriority: aiResult.topPriority,
                quickWins: aiResult.quickWins,
                longTermStrategies: aiResult.longTermStrategies,
                analyzedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Revenue Intelligence optimization suggestions failed for tenant ${tenantId}:`, error.message);
            return {
                tenantId,
                suggestions: [],
                overallHealthScore: 0,
                topPriority: 'Unable to determine',
                quickWins: [],
                longTermStrategies: [],
                analyzedAt: new Date(),
                aiPowered: false,
            };
        }
    }
}
