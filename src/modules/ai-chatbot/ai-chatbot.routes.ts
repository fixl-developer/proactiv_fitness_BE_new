import { Router } from 'express';
import aiChatbotController from './ai-chatbot.controller';

const router = Router();

router.use('/ai', aiChatbotController);

export default router;
