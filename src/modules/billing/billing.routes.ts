import { Router } from 'express';
import billingController from './billing.controller';

const router = Router();

router.use('/', billingController);

export default router;
