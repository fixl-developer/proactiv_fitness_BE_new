import { Router } from 'express';
import aiCoachController from './ai-coach.controller';

const router = Router();

router.use('/ai-coach', aiCoachController);

export default router;
