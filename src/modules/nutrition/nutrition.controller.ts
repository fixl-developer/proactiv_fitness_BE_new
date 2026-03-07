import { Request, Response, NextFunction } from 'express';
import { nutritionService } from './nutrition.service';
import { AppError } from '../../utils/appError';

export class NutritionController {
    async generatePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { studentId, programId, name, duration, startDate, goals } = req.body;

            if (!studentId || !name || !duration || !startDate) {
                throw new AppError('Missing required fields', 400);
            }

            const plan = await nutritionService.generateMealPlan({
                studentId,
                programId,
                name,
                duration,
                startDate: new Date(startDate),
                endDate: new Date(new Date(startDate).getTime() + duration * 24 * 60 * 60 * 1000),
                goals
            });

            res.status(201).json({ success: true, data: plan });
        } catch (error) {
            next(error);
        }
    }

    async getPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { studentId } = req.params;
            const { status } = req.query;

            const plans = await nutritionService.getMealPlans(studentId, status as string);

            res.status(200).json({ success: true, count: plans.length, data: plans });
        } catch (error) {
            next(error);
        }
    }

    async trackMeal(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { studentId, planId, date, mealType, consumed, photos, notes, mood, energy } = req.body;

            if (!studentId || !date || !mealType || !consumed) {
                throw new AppError('Missing required fields', 400);
            }

            const tracking = await nutritionService.trackMeal({
                studentId,
                planId,
                date: new Date(date),
                mealType,
                consumed,
                photos,
                notes,
                mood,
                energy
            });

            res.status(201).json({ success: true, data: tracking });
        } catch (error) {
            next(error);
        }
    }

    async generateGroceryList(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { planId } = req.params;
            const { weekStartDate } = req.body;

            if (!weekStartDate) {
                throw new AppError('Week start date is required', 400);
            }

            const groceryList = await nutritionService.generateGroceryList(planId, new Date(weekStartDate));

            res.status(201).json({ success: true, data: groceryList });
        } catch (error) {
            next(error);
        }
    }

    async getRecipes(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters = req.query;
            const recipes = await nutritionService.getRecipes(filters);

            res.status(200).json({ success: true, count: recipes.length, data: recipes });
        } catch (error) {
            next(error);
        }
    }

    async setDietaryRestrictions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { studentId, allergies, intolerances, preferences, dislikes, medicalConditions, notes } = req.body;

            if (!studentId) {
                throw new AppError('Student ID is required', 400);
            }

            const restriction = await nutritionService.setDietaryRestrictions({
                studentId,
                allergies,
                intolerances,
                preferences,
                dislikes,
                medicalConditions,
                notes
            });

            res.status(200).json({ success: true, data: restriction });
        } catch (error) {
            next(error);
        }
    }

    async getRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { studentId } = req.params;
            const recommendations = await nutritionService.getRecommendations(studentId);

            res.status(200).json({ success: true, data: recommendations });
        } catch (error) {
            next(error);
        }
    }
}

export const nutritionController = new NutritionController();
