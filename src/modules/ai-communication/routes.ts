import { Router } from 'express';
import aiCommunicationController from './controller';

const router = Router();

router.use('/ai-communication', aiCommunicationController);

export default router;
