import { Router } from 'express';
import parentAIAssistantController from './parent-ai-assistant.controller';

const router = Router();

router.use('/parent-ai-assistant', parentAIAssistantController);

export default router;
