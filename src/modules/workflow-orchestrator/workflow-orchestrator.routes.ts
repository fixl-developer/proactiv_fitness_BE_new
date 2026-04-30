import { Router } from 'express';
import workflowOrchestratorController from './workflow-orchestrator.controller';

const router = Router();

router.use('/workflow-orchestrator', workflowOrchestratorController);

export default router;
