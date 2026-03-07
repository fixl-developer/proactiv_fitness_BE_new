import { MealPlan } from './nutrition.model';
import { IMealPlan } from './nutrition.interface';

export class NutritionService {
    async createMealPlan(data: Partial<IMealPlan>): Promise<IMealPlan> {
        const mealPlan = new MealPlan(data);
        return await mealPlan.save();
    }

    async getMealPlans(userId: string): Promise<IMealPlan[]> {
        return await MealPlan.find({ userId }).sort({ createdAt: -1 });
    }

    async getMealPlanById(id: string): Promise<IMealPlan | null> {
        return await MealPlan.findById(id);
    }

    async updateMealPlan(id: string, data: Partial<IMealPlan>): Promise<IMealPlan | null> {
        return await MealPlan.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteMealPlan(id: string): Promise<boolean> {
        const result = await MealPlan.findByIdAndDelete(id);
        return !!result;
    }
}
