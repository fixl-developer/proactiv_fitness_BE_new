import { Router } from 'express';
import aiVideoAnalysisController from './ai-video-analysis.controller';

const router = Router();

router.use('/ai-video-analysis', aiVideoAnalysisController);

export default router;
