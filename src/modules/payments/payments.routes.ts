import { Router } from 'express';
import paymentController from './payments.controller';

const router = Router();

router.use('/payments', paymentController);

export default router;
