import { Router } from 'express';
import integrationsController from './integrations.controller';

const router = Router();

router.use('/', integrationsController);

export default router;
