import { Router } from 'express';
import smartSupportController from './smart-support.controller';

const router = Router();

router.use('/smart-support', smartSupportController);

export default router;
