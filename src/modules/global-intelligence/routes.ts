import { Router } from 'express';
import globalIntelligenceController from './controller';

const router = Router();

router.use('/', globalIntelligenceController);

export default router;
