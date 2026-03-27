import { Router } from 'express';
import globalIntelligenceController from './controller';

const router = Router();

router.use('/global-intelligence', globalIntelligenceController);

export default router;
