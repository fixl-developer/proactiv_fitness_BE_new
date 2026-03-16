import { Router } from 'express';
import smartNutritionController from './smart-nutrition.controller';

const router = Router();

router.use('/nutrition', smartNutritionController);

export default router;
