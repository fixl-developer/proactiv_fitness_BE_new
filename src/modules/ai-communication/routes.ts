import { Router } from 'express';
import aiCommunicationController from './controller';

const router = Router();

router.use('/', aiCommunicationController);

export default router;
