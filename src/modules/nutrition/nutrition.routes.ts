import { Router } from 'express';
import { NutritionController } from './nutrition.controller';

const router = Router();
const controller = new NutritionController();

router.post('/meal-plans', controller.createMealPlan);
router.get('/meal-plans', controller.getMealPlans);
router.get('/meal-plans/:id', controller.getMealPlanById);
router.put('/meal-plans/:id', controller.updateMealPlan);
router.delete('/meal-plans/:id', controller.deleteMealPlan);

export default router;
