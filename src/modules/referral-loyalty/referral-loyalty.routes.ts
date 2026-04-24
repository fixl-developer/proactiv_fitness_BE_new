import { Router } from 'express';
import referralLoyaltyController from './referral-loyalty.controller';

const router = Router();

router.use('/referral-loyalty', referralLoyaltyController);

export default router;
