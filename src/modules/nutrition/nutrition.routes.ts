import { Router } from 'express';
import { nutritionController } from './nutrition.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/generate-plan', nutritionController.generatePlan.bind(nutritionController));
router.get('/plans/:studentId', nutritionController.getPlans.bind(nutritionController));
router.post('/track-meal', nutritionController.trackMeal.bind(nutritionController));
router.post('/grocery-list/:planId', nutritionController.generateGroceryList.bind(nutritionController));
router.get('/recipes', nutritionController.getRecipes.bind(nutritionController));
router.post('/dietary-restrictions', nutritionController.setDietaryRestrictions.bind(nutritionController));
router.get('/recommendations/:studentId', nutritionController.getRecommendations.bind(nutritionController));

export default router;
