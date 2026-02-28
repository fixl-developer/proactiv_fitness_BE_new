import mongoose, { Schema } from 'mongoose';
import { IForecastSimulation } from './forecast.interface';

const ForecastSimulationSchema = new Schema<IForecastSimulation>(
    {
        simulationId: { type: String, required: true, unique: true },
        termId: { type: String, required: true, index: true },
        termName: { type: String, required: true },

        scenarios: [{
            scenarioName: { type: String, required: true },
            assumptions: {
                enrollmentGrowth: { type: Number, required: true },
                priceIncrease: { type: Number, required: true },
                retentionRate: { type: Number, required: true }
            },
            projectedRevenue: { type: Number, required: true },
            projectedCapacity: { type: Number, required: true },
            projectedDemand: { type: Number, required: true }
        }],

        businessUnitId: { type: String, required: true, index: true },

        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'forecast_simulations' }
);

ForecastSimulationSchema.index({ termId: 1, createdAt: -1 });

export const ForecastSimulation = mongoose.model<IForecastSimulation>('ForecastSimulation', ForecastSimulationSchema);
