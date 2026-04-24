import { ForecastSimulation } from './forecast.model';
import { IRunSimulationRequest } from './forecast.interface';
import { AppError } from '../../shared/utils/app-error.util';
import { v4 as uuidv4 } from 'uuid';
import aiService from '@shared/services/ai.service';
import { AIPromptService } from '@shared/services/ai-prompt.service';
import logger from '@shared/utils/logger.util';

export class ForecastSimulatorService {
    // ─── AI-Enhanced Simulation ────────────────────────────────
    async runSimulation(data: IRunSimulationRequest, userId: string): Promise<any> {
        const simulationId = uuidv4();

        // Gather historical simulations for context
        const historicalSimulations = await ForecastSimulation.find({ termId: data.termId })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        // Process each scenario with mathematical projections
        const processedScenarios = data.scenarios.map((scenario: any) => {
            const baseRevenue = (data as any).baseRevenue || 100000;
            const baseCapacity = (data as any).baseCapacity || 200;
            const baseDemand = (data as any).baseDemand || 180;

            const enrollmentMultiplier = 1 + (scenario.assumptions.enrollmentGrowth / 100);
            const priceMultiplier = 1 + (scenario.assumptions.priceIncrease / 100);
            const retentionMultiplier = scenario.assumptions.retentionRate / 100;

            return {
                scenarioName: scenario.scenarioName,
                assumptions: scenario.assumptions,
                projectedRevenue: Math.round(baseRevenue * enrollmentMultiplier * priceMultiplier * retentionMultiplier),
                projectedCapacity: Math.round(baseCapacity * enrollmentMultiplier),
                projectedDemand: Math.round(baseDemand * enrollmentMultiplier * retentionMultiplier),
            };
        });

        // Use AI for strategic analysis on top of mathematical projections
        let aiAnalysis: any = null;

        try {
            const prompt = AIPromptService.forecastSimulation({
                scenarios: processedScenarios,
                historicalData: historicalSimulations.map(s => ({
                    termId: s.termId,
                    scenarios: s.scenarios,
                    createdAt: s.createdAt,
                })),
                currentBaseline: {
                    baseRevenue: (data as any).baseRevenue || 100000,
                    baseCapacity: (data as any).baseCapacity || 200,
                    baseDemand: (data as any).baseDemand || 180,
                },
            });

            aiAnalysis = await aiService.jsonCompletion<{
                scenarioResults: Array<{
                    scenarioName: string;
                    riskLevel: string;
                    confidence: number;
                    keyAssumptions: string[];
                }>;
                bestScenario: string;
                reasoning: string;
                risks: string[];
                strategicRecommendations: string[];
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'forecast-simulator',
                temperature: 0.5,
            });

            // Enrich processed scenarios with AI insights
            processedScenarios.forEach((scenario: any) => {
                const aiScenario = aiAnalysis.scenarioResults?.find(
                    (s: any) => s.scenarioName === scenario.scenarioName
                );
                if (aiScenario) {
                    scenario.riskLevel = aiScenario.riskLevel;
                    scenario.confidence = aiScenario.confidence;
                    scenario.keyAssumptions = aiScenario.keyAssumptions;
                }
            });

            logger.info(`Forecast Simulator: AI-enhanced simulation completed — Best scenario: ${aiAnalysis.bestScenario}`);
        } catch (error: any) {
            logger.warn(`Forecast Simulator: AI analysis failed, using mathematical projections only — ${error.message}`);
        }

        const simulation = new ForecastSimulation({
            simulationId,
            termId: data.termId,
            termName: (data as any).termName || 'Current Term',
            scenarios: processedScenarios,
            aiAnalysis: aiAnalysis ? {
                bestScenario: aiAnalysis.bestScenario,
                reasoning: aiAnalysis.reasoning,
                risks: aiAnalysis.risks,
                strategicRecommendations: aiAnalysis.strategicRecommendations,
                aiPowered: true,
            } : { aiPowered: false },
            businessUnitId: (data as any).businessUnitId || 'bu-001',
            createdBy: userId,
            updatedBy: userId,
        });

        return await simulation.save();
    }

    // ─── Get Simulation ────────────────────────────────────────
    async getSimulation(simulationId: string): Promise<any> {
        const simulation = await ForecastSimulation.findOne({ simulationId });

        if (!simulation) {
            throw new AppError('Simulation not found', 404);
        }

        return simulation;
    }

    // ─── Get Simulations by Term ───────────────────────────────
    async getSimulationsByTerm(termId: string): Promise<any[]> {
        return await ForecastSimulation.find({ termId }).sort({ createdAt: -1 });
    }

    // ─── AI-Enhanced Scenario Comparison ───────────────────────
    async compareScenarios(simulationId: string): Promise<any> {
        const simulation = await this.getSimulation(simulationId);

        const scenarioComparison = simulation.scenarios.map((scenario: any) => ({
            scenarioName: scenario.scenarioName,
            projectedRevenue: scenario.projectedRevenue,
            projectedCapacity: scenario.projectedCapacity,
            projectedDemand: scenario.projectedDemand,
            utilizationRate: Math.round((scenario.projectedDemand / scenario.projectedCapacity) * 100),
            revenuePerStudent: Math.round(scenario.projectedRevenue / scenario.projectedDemand),
            riskLevel: scenario.riskLevel || 'unknown',
            confidence: scenario.confidence || 0,
        }));

        // Use AI analysis if available from simulation
        const aiInsights = simulation.aiAnalysis || {};
        const bestScenario = aiInsights.bestScenario || this.identifyBestScenario(simulation.scenarios);
        const recommendations = aiInsights.strategicRecommendations || this.generateFallbackRecommendations(simulation.scenarios);

        return {
            simulationId: simulation.simulationId,
            termId: simulation.termId,
            termName: simulation.termName,
            scenarios: scenarioComparison,
            bestScenario,
            reasoning: aiInsights.reasoning || 'Based on highest projected revenue',
            risks: aiInsights.risks || [],
            recommendations,
            aiPowered: !!aiInsights.aiPowered,
        };
    }

    // ─── Fallback Helpers ──────────────────────────────────────

    private identifyBestScenario(scenarios: any[]): string {
        let bestScenario = scenarios[0];
        let maxRevenue = scenarios[0]?.projectedRevenue || 0;

        scenarios.forEach(scenario => {
            if (scenario.projectedRevenue > maxRevenue) {
                maxRevenue = scenario.projectedRevenue;
                bestScenario = scenario;
            }
        });

        return bestScenario?.scenarioName || 'Unknown';
    }

    private generateFallbackRecommendations(scenarios: any[]): string[] {
        const recommendations: string[] = [];

        scenarios.forEach(scenario => {
            const utilizationRate = (scenario.projectedDemand / scenario.projectedCapacity) * 100;

            if (utilizationRate > 90) {
                recommendations.push(`${scenario.scenarioName}: Consider increasing capacity to meet high demand`);
            } else if (utilizationRate < 60) {
                recommendations.push(`${scenario.scenarioName}: Focus on marketing to improve enrollment`);
            }

            if (scenario.assumptions?.retentionRate < 80) {
                recommendations.push(`${scenario.scenarioName}: Implement retention strategies to improve student retention`);
            }
        });

        return recommendations;
    }
}
