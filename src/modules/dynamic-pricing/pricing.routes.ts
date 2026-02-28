import { Router } from 'express';
import { DynamicPricingController } from './pricing.controller';

const router = Router();
const controller = new DynamicPricingController();

router.post('/calculate', controller.calculatePrice);
router.get('/:programId', controller.getCurrentPricing);

export default router;
