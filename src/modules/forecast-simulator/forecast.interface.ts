import { Document } from 'mongoose';

export interface IForecastSimulation extends Document {
    simulationId: string;
    termId: string;
    termName: string;
    scenarios: {
        scenarioName: string;
        assumptions: {
            enrollmentGrowth: number;
            priceIncrease: number;
            retentionRate: number;
        };
        projectedRevenue: number;
        projectedCapacity: number;
        projectedDemand: number;
    }[];
    businessUnitId: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IRunSimulationRequest {
    termId: string;
    scenarios: any[];
}
