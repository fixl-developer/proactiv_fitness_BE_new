import { Router } from 'express';
import aiGamificationEngineController from './controller';

const router = Router();

router.use('/', aiGamificationEngineController);

export default router;
