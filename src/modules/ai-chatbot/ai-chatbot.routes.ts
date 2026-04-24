import { Router } from 'express';
import aiChatbotController from './ai-chatbot.controller';

const router = Router();

// FIXED: index.ts already mounts this router at '/ai'; mount controller at '/' to avoid /ai/ai/*
router.use('/', aiChatbotController);

export default router;
