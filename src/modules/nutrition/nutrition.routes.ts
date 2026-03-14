import { Router } from 'express';
import nutritionController from './nutrition.controller';
import { authenticate } from '@/middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/plans', nutritionController.getNutritionPlans);
router.post('/plans', nutritionController.createNutritionPlan);
router.get('/plans/:id', nutritionController.getNutritionPlanById);
router.put('/plans/:id', nutritionController.updateNutritionPlan);
router.delete('/plans/:id', nutritionController.deleteNutritionPlan);

router.get('/recipes', nutritionController.getRecipes);
router.get('/recipes/search', nutritionController.searchRecipes);
router.get('/recipes/:id', nutritionController.getRecipeById);

router.post('/tracking/log', nutritionController.logMeal);
router.get('/tracking', nutritionController.getNutritionTracking);
router.get('/recommendations', nutritionController.getNutritionRecommendations);

export default router;
