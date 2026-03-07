import { Request, Response, NextFunction } from 'express';
import { NutritionService } from './nutrition.service';

const nutritionService = new NutritionService();

export class NutritionController {
    async createMealPlan(req: Request, res: Response, next: NextFunction) {
        try {
            const mealPlan = await nutritionService.createMealPlan(req.body);
            res.status(201).json({ success: true, data: mealPlan });
        } catch (error) {
            next(error);
        }
    }

    async getMealPlans(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id || req.query.userId as string;
            const mealPlans = await nutritionService.getMealPlans(userId);
            res.json({ success: true, data: mealPlans });
        } catch (error) {
            next(error);
        }
    }

    async getMealPlanById(req: Request, res: Response, next: NextFunction) {
        try {
            const mealPlan = await nutritionService.getMealPlanById(req.params.id);
            res.json({ success: true, data: mealPlan });
        } catch (error) {
            next(error);
        }
    }

    async updateMealPlan(req: Request, res: Response, next: NextFunction) {
        try {
            const mealPlan = await nutritionService.updateMealPlan(req.params.id, req.body);
            res.json({ success: true, data: mealPlan });
        } catch (error) {
            next(error);
        }
    }

    async deleteMealPlan(req: Request, res: Response, next: NextFunction) {
        try {
            await nutritionService.deleteMealPlan(req.params.id);
            res.json({ success: true, message: 'Meal plan deleted' });
        } catch (error) {
            next(error);
        }
    }
}
