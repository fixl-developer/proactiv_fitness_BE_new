import { Router } from 'express';
import integrationsController from './integrations.controller';

const router = Router();

router.use('/integrations', integrationsController);

export default router;
