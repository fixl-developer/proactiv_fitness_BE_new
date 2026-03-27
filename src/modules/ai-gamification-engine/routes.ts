import { Router } from 'express';
import aiGamificationEngineController from './controller';

const router = Router();

router.use('/ai-gamification-engine', aiGamificationEngineController);

export default router;
