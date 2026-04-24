import { Router } from 'express';
import aiContentEngineController from './ai-content-engine.controller';

const router = Router();

router.use('/ai-content-engine', aiContentEngineController);

export default router;
