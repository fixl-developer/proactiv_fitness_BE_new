import { Router } from 'express';
import revenueIntelligenceController from './revenue-intelligence.controller';

const router = Router();

router.use('/revenue-intelligence', revenueIntelligenceController);

export default router;
