import { Router, Request, Response } from 'express';
import nutritionController from './nutrition.controller';
import { authenticate, authorize } from '@modules/iam/auth.middleware';
import { MealLogModel } from './meal-log.model';

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

// ─── User-facing meal log CRUD (frontend calls /user/nutrition/meals) ───
router.get('/meals', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const meals = await MealLogModel.find({ userId }).sort({ consumedAt: -1 }).lean();
        res.json({ success: true, data: meals });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/meals', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const { mealType, mealName, calories, protein, carbs, fats, consumedAt, notes } = req.body || {};
        if (!mealType || !String(mealName ?? '').trim() || calories === undefined || calories === null || !consumedAt) {
            res.status(400).json({
                success: false,
                message: 'mealType, mealName, calories and consumedAt are required',
            });
            return;
        }
        const meal = await MealLogModel.create({
            userId,
            mealType,
            mealName: String(mealName).trim(),
            calories: Number(calories) || 0,
            protein: Number(protein) || 0,
            carbs: Number(carbs) || 0,
            fats: Number(fats) || 0,
            consumedAt: new Date(consumedAt),
            notes: notes || '',
        });
        res.status(201).json({ success: true, data: meal, message: 'Meal logged' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/meals/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const result = await MealLogModel.deleteOne({ _id: req.params.id, userId });
        if (result.deletedCount === 0) {
            res.status(404).json({ success: false, message: 'Meal not found' });
            return;
        }
        res.json({ success: true, message: 'Meal deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
