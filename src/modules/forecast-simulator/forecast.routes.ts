import { Router } from 'express';
import * as forecastController from './forecast.controller';

const router = Router();

router.post('/run', forecastController.runSimulation);
router.get('/:simulationId', forecastController.getSimulation);
router.get('/:simulationId/compare', forecastController.compareScenarios);

export default router;
