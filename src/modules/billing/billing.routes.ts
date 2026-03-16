import { Router } from 'express';
import billingController from './billing.controller';

const router = Router();

router.use('/billing', billingController);

export default router;
