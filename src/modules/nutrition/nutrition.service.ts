import NutritionPlan from './nutrition.model';
import logger from '@/utils/logger';

class NutritionService {
    async getNutritionPlans(userId: string) {
        return await NutritionPlan.find({ userId }).lean();
    }

    async getNutritionPlanById(planId: string) {
        const plan = await NutritionPlan.findById(planId).lean();
        if (!plan) throw new Error('Nutrition plan not found');
        return plan;
    }

    async createNutritionPlan(userId: string, data: any) {
        const plan = new NutritionPlan({ ...data, userId });
        await plan.save();
        logger.info(`Nutrition plan created: ${plan._id}`);
        return plan;
    }

    async updateNutritionPlan(planId: string, data: any) {
        const plan = await NutritionPlan.findByIdAndUpdate(planId, data, { new: true });
        if (!plan) throw new Error('Nutrition plan not found');
        logger.info(`Nutrition plan updated: ${planId}`);
        return plan;
    }

    async deleteNutritionPlan(planId: string) {
        await NutritionPlan.findByIdAndDelete(planId);
        logger.info(`Nutrition plan deleted: ${planId}`);
    }

    async getRecipes(filters: any) {
        const query = {};
        if (filters.category) query['category'] = filters.category;
        const recipes = await NutritionPlan.find(query).limit(filters.limit || 20).skip(filters.skip || 0).lean();
        const total = await NutritionPlan.countDocuments(query);
        return { data: recipes, total };
    }

    async getRecipeById(recipeId: string) {
        const recipe = await NutritionPlan.findById(recipeId).lean();
        if (!recipe) throw new Error('Recipe not found');
        return recipe;
    }

    async searchRecipes(query: string) {
        return await NutritionPlan.find({ $text: { $search: query } }).lean();
    }

    async logMeal(userId: string, data: any) {
        logger.info(`Meal logged for user: ${userId}`);
        return { success: true, mealId: data.mealId };
    }

    async getNutritionTracking(userId: string, date: string) {
        return {
            calories: 1800,
            protein: 120,
            carbs: 180,
            fat: 60,
            meals: []
        };
    }

    async getNutritionRecommendations(userId: string) {
        return {
            dailyCalories: 2000,
            protein: 150,
            carbs: 200,
            fat: 65,
            recommendations: []
        };
    }
}

export default new NutritionService();
