import { Request, Response } from 'express';
import nutritionService from './nutrition.service';
import { asyncHandler } from '@/middleware/asyncHandler';

class NutritionController {
    getNutritionPlans = asyncHandler(async (req: Request, res: Response) => {
        const plans = await nutritionService.getNutritionPlans(req.user.id);
        res.json({ success: true, data: plans });
    });

    getNutritionPlanById = asyncHandler(async (req: Request, res: Response) => {
        const plan = await nutritionService.getNutritionPlanById(req.params.id);
        res.json({ success: true, data: plan });
    });

    createNutritionPlan = asyncHandler(async (req: Request, res: Response) => {
        const plan = await nutritionService.createNutritionPlan(req.user.id, req.body);
        res.status(201).json({ success: true, data: plan });
    });

    updateNutritionPlan = asyncHandler(async (req: Request, res: Response) => {
        const plan = await nutritionService.updateNutritionPlan(req.params.id, req.body);
        res.json({ success: true, data: plan });
    });

    deleteNutritionPlan = asyncHandler(async (req: Request, res: Response) => {
        await nutritionService.deleteNutritionPlan(req.params.id);
        res.json({ success: true, message: 'Plan deleted' });
    });

    getRecipes = asyncHandler(async (req: Request, res: Response) => {
        const recipes = await nutritionService.getRecipes(req.query);
        res.json({ success: true, data: recipes });
    });

    getRecipeById = asyncHandler(async (req: Request, res: Response) => {
        const recipe = await nutritionService.getRecipeById(req.params.id);
        res.json({ success: true, data: recipe });
    });

    searchRecipes = asyncHandler(async (req: Request, res: Response) => {
        const recipes = await nutritionService.searchRecipes(req.query.q as string);
        res.json({ success: true, data: recipes });
    });

    logMeal = asyncHandler(async (req: Request, res: Response) => {
        const result = await nutritionService.logMeal(req.user.id, req.body);
        res.json({ success: true, data: result });
    });

    getNutritionTracking = asyncHandler(async (req: Request, res: Response) => {
        const tracking = await nutritionService.getNutritionTracking(req.user.id, req.query.date as string);
        res.json({ success: true, data: tracking });
    });

    getNutritionRecommendations = asyncHandler(async (req: Request, res: Response) => {
        const recommendations = await nutritionService.getNutritionRecommendations(req.user.id);
        res.json({ success: true, data: recommendations });
    });
}

export default new NutritionController();
