import { ForecastSimulation } from './forecast.model';
import { IRunSimulationRequest } from './forecast.interface';
import { AppError } from '../../shared/utils/app-error.util';
import { v4 as uuidv4 } from 'uuid';

export class ForecastSimulatorService {
    async runSimulation(data: IRunSimulationRequest, userId: string): Promise<any> {
        const simulationId = uuidv4();

        // Process each scenario and calculate projections
        const processedScenarios = data.scenarios.map((scenario: any) => {
            const baseRevenue = 100000;
            const baseCapacity = 200;
            const baseDemand = 180;

            const enrollmentMultiplier = 1 + (scenario.assumptions.enrollmentGrowth / 100);
            const priceMultiplier = 1 + (scenario.assumptions.priceIncrease / 100);
            const retentionMultiplier = scenario.assumptions.retentionRate / 100;

            return {
                scenarioName: scenario.scenarioName,
                assumptions: scenario.assumptions,
                projectedRevenue: Math.round(baseRevenue * enrollmentMultiplier * priceMultiplier * retentionMultiplier),
                projectedCapacity: Math.round(baseCapacity * enrollmentMultiplier),
                projectedDemand: Math.round(baseDemand * enrollmentMultiplier * retentionMultiplier)
            };
        });

        const simulation = new ForecastSimulation({
            simulationId,
            termId: data.termId,
            termName: 'Spring 2026',
            scenarios: processedScenarios,
            businessUnitId: 'bu-001',
            createdBy: userId,
            updatedBy: userId
        });

        return await simulation.save();
    }

    async getSimulation(simulationId: string): Promise<any> {
        const simulation = await ForecastSimulation.findOne({ simulationId });

        if (!simulation) {
            throw new AppError('Simulation not found', 404);
        }

        return simulation;
    }

    async getSimulationsByTerm(termId: string): Promise<any[]> {
        return await ForecastSimulation.find({ termId }).sort({ createdAt: -1 });
    }

    async compareScenarios(simulationId: string): Promise<any> {
        const simulation = await this.getSimulation(simulationId);

        const comparison = {
            simulationId: simulation.simulationId,
            termId: simulation.termId,
            termName: simulation.termName,
            scenarios: simulation.scenarios.map((scenario: any) => ({
                scenarioName: scenario.scenarioName,
                projectedRevenue: scenario.projectedRevenue,
                projectedCapacity: scenario.projectedCapacity,
                projectedDemand: scenario.projectedDemand,
                utilizationRate: Math.round((scenario.projectedDemand / scenario.projectedCapacity) * 100),
                revenuePerStudent: Math.round(scenario.projectedRevenue / scenario.projectedDemand)
            })),
            bestScenario: this.identifyBestScenario(simulation.scenarios),
            recommendations: this.generateRecommendations(simulation.scenarios)
        };

        return comparison;
    }

    private identifyBestScenario(scenarios: any[]): string {
        let bestScenario = scenarios[0];
        let maxRevenue = scenarios[0].projectedRevenue;

        scenarios.forEach(scenario => {
            if (scenario.projectedRevenue > maxRevenue) {
                maxRevenue = scenario.projectedRevenue;
                bestScenario = scenario;
            }
        });

        return bestScenario.scenarioName;
    }

    private generateRecommendations(scenarios: any[]): string[] {
        const recommendations: string[] = [];

        scenarios.forEach(scenario => {
            const utilizationRate = (scenario.projectedDemand / scenario.projectedCapacity) * 100;

            if (utilizationRate > 90) {
                recommendations.push(`${scenario.scenarioName}: Consider increasing capacity to meet high demand`);
            } else if (utilizationRate < 60) {
                recommendations.push(`${scenario.scenarioName}: Focus on marketing to improve enrollment`);
            }

            if (scenario.assumptions.retentionRate < 80) {
                recommendations.push(`${scenario.scenarioName}: Implement retention strategies to improve student retention`);
            }
        });

        return recommendations;
    }
}
