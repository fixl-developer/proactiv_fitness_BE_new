import { Router } from 'express';
import apiPlatformAdvancedController from './api-platform-advanced.controller';

const router = Router();

router.use('/api-platform', apiPlatformAdvancedController);

export default router;
