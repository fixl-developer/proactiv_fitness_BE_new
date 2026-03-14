import { Router } from 'express';
import aiCoachAssistantController from './ai-coach-assistant.controller';

const router = Router();

router.use('/ai-coach-assistant', aiCoachAssistantController);

export default router;
