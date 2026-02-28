import { Request, Response } from 'express';
import { ForecastSimulatorService } from './forecast.service';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { sendSuccess } from '../../shared/utils/response.util';

const forecastService = new ForecastSimulatorService();

export const runSimulation = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || 'system';
    const simulation = await forecastService.runSimulation(req.body, userId);
    sendSuccess(res, simulation, 'Simulation run successfully', 201);
});

export const getSimulation = asyncHandler(async (req: Request, res: Response) => {
    const { simulationId } = req.params;
    const simulation = await forecastService.getSimulation(simulationId);
    sendSuccess(res, simulation, 'Simulation retrieved successfully');
});

export const compareScenarios = asyncHandler(async (req: Request, res: Response) => {
    const { simulationId } = req.params;
    const comparison = await forecastService.compareScenarios(simulationId);
    sendSuccess(res, comparison, 'Scenario comparison retrieved successfully');
});
