import { Router } from 'express';
import apiDeveloperController from './api-developer-platform.controller';

const router = Router();

router.use('/api-developer-platform', apiDeveloperController);

export default router;
