import { Router, Request, Response } from 'express';
import { SmartNutritionService } from './smart-nutrition.service';
import { authMiddleware, roleMiddleware } from '../../middleware';

const router = Router();
const service = new SmartNutritionService();

// Generate meal plan
router.post('/meal-plans', authMiddleware, roleMiddleware(['PARENT', 'COACH']), async (req: Request, res: Response) => {
    try {
        const plan = await service.generateMealPlan(req.body);
        res.json({ success: true, data: plan });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get meal plans
router.get('/meal-plans/:childId', authMiddleware, async (req: Request, res: Response) => {
    try {
        const plans = await service.getMealPlans(req.params.childId);
        res.json({ success: true, data: plans });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Track nutrition
router.post('/tracking', authMiddleware, roleMiddleware(['PARENT']), async (req: Request, res: Response) => {
    try {
        const tracking = await service.trackNutrition(req.body);
        res.json({ success: true, data: tracking });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get nutrition recommendations
router.get('/recommendations/:childId', authMiddleware, async (req: Request, res: Response) => {
    try {
        const recommendations = await service.getNutritionRecommendations(req.params.childId);
        res.json({ success: true, data: recommendations });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate grocery list
router.post('/grocery-list', authMiddleware, roleMiddleware(['PARENT']), async (req: Request, res: Response) => {
    try {
        const list = await service.generateGroceryList(req.body.mealPlanId);
        res.json({ success: true, data: list });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get recipes
router.get('/recipes', authMiddleware, async (req: Request, res: Response) => {
    try {
        const recipes = await service.getRecipes(req.query.dietary as string);
        res.json({ success: true, data: recipes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
