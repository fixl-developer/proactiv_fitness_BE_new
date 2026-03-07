import { MealPlan, Recipe, MealTracking, GroceryList, DietaryRestriction, NutritionRecommendation } from './nutrition.model';
import { IMealPlan, IRecipe, IMealTracking, IGroceryList, IDietaryRestriction, INutritionRecommendation } from './nutrition.interface';
import { AppError } from '../../utils/appError';
import { logger } from '../../utils/logger';

export class NutritionService {
    // Generate AI meal plan
    async generateMealPlan(data: Partial<IMealPlan>): Promise<IMealPlan> {
        try {
            logger.info('Generating meal plan', { studentId: data.studentId });

            const restrictions = await this.getDietaryRestrictions(data.studentId!);
            const recommendations = await this.getRecommendations(data.studentId!);

            const meals = await this.generateMeals(
                data.duration || 7,
                recommendations,
                restrictions
            );

            const plan = await MealPlan.create({
                ...data,
                id: `plan_${Date.now()}`,
                meals,
                generatedBy: 'ai',
                status: 'active',
                adherence: 0
            });

            return plan.toObject();
        } catch (error) {
            logger.error('Error generating meal plan', { error, data });
            throw new AppError('Failed to generate meal plan', 500);
        }
    }

    // Get meal plans for student
    async getMealPlans(studentId: string, status?: string): Promise<IMealPlan[]> {
        try {
            const query: any = { studentId };
            if (status) query.status = status;

            const plans = await MealPlan.find(query).sort({ createdAt: -1 });
            return plans.map(p => p.toObject());
        } catch (error) {
            logger.error('Error getting meal plans', { error, studentId });
            throw new AppError('Failed to get meal plans', 500);
        }
    }

    // Track meal consumption
    async trackMeal(data: Partial<IMealTracking>): Promise<IMealTracking> {
        try {
            logger.info('Tracking meal', { studentId: data.studentId });

            const totalNutrition = this.calculateTotalNutrition(data.consumed || []);

            const tracking = await MealTracking.create({
                ...data,
                id: `track_${Date.now()}`,
                totalNutrition
            });

            // Update plan adherence
            if (data.planId) {
                await this.updatePlanAdherence(data.planId);
            }

            return tracking.toObject();
        } catch (error) {
            logger.error('Error tracking meal', { error, data });
            throw new AppError('Failed to track meal', 500);
        }
    }

    // Generate grocery list
    async generateGroceryList(planId: string, weekStartDate: Date): Promise<IGroceryList> {
        try {
            logger.info('Generating grocery list', { planId });

            const plan = await MealPlan.findOne({ id: planId });
            if (!plan) throw new AppError('Meal plan not found', 404);

            const items = await this.aggregateIngredients(plan.meals);

            const groceryList = await GroceryList.create({
                id: `grocery_${Date.now()}`,
                planId,
                studentId: plan.studentId,
                weekStartDate,
                items,
                status: 'pending',
                totalCost: this.estimateTotalCost(items)
            });

            return groceryList.toObject();
        } catch (error) {
            logger.error('Error generating grocery list', { error, planId });
            throw new AppError('Failed to generate grocery list', 500);
        }
    }

    // Get recipes
    async getRecipes(filters?: any): Promise<IRecipe[]> {
        try {
            const query: any = {};

            if (filters?.category) query.category = { $in: [filters.category] };
            if (filters?.difficulty) query.difficulty = filters.difficulty;
            if (filters?.maxPrepTime) query.prepTime = { $lte: filters.maxPrepTime };
            if (filters?.vegetarian) query['dietaryInfo.vegetarian'] = true;
            if (filters?.vegan) query['dietaryInfo.vegan'] = true;

            const recipes = await Recipe.find(query).limit(50);
            return recipes.map(r => r.toObject());
        } catch (error) {
            logger.error('Error getting recipes', { error, filters });
            throw new AppError('Failed to get recipes', 500);
        }
    }

    // Set dietary restrictions
    async setDietaryRestrictions(data: Partial<IDietaryRestriction>): Promise<IDietaryRestriction> {
        try {
            const restriction = await DietaryRestriction.findOneAndUpdate(
                { studentId: data.studentId },
                { $set: data },
                { new: true, upsert: true }
            );

            return restriction!.toObject();
        } catch (error) {
            logger.error('Error setting dietary restrictions', { error, data });
            throw new AppError('Failed to set dietary restrictions', 500);
        }
    }

    // Get dietary restrictions
    async getDietaryRestrictions(studentId: string): Promise<IDietaryRestriction | null> {
        try {
            const restriction = await DietaryRestriction.findOne({ studentId });
            return restriction ? restriction.toObject() : null;
        } catch (error) {
            logger.error('Error getting dietary restrictions', { error, studentId });
            throw new AppError('Failed to get dietary restrictions', 500);
        }
    }

    // Get nutrition recommendations
    async getRecommendations(studentId: string): Promise<INutritionRecommendation> {
        try {
            let recommendation = await NutritionRecommendation.findOne({ studentId })
                .sort({ generatedAt: -1 });

            if (!recommendation) {
                // Generate default recommendations
                recommendation = await this.generateRecommendations(studentId);
            }

            return recommendation.toObject();
        } catch (error) {
            logger.error('Error getting recommendations', { error, studentId });
            throw new AppError('Failed to get recommendations', 500);
        }
    }

    // Generate nutrition recommendations
    private async generateRecommendations(studentId: string): Promise<any> {
        // In production, this would use AI/ML based on student data
        const recommendation = await NutritionRecommendation.create({
            studentId,
            basedOn: {
                age: 12,
                weight: 45,
                height: 150,
                activityLevel: 'active',
                goals: ['muscle_gain', 'energy']
            },
            recommendations: {
                dailyCalories: 2000,
                macros: {
                    protein: { grams: 100, percentage: 20 },
                    carbs: { grams: 250, percentage: 50 },
                    fats: { grams: 67, percentage: 30 }
                },
                hydration: 2.5,
                meals: 5,
                timing: ['7:00 AM', '10:00 AM', '1:00 PM', '4:00 PM', '7:00 PM'],
                supplements: ['Multivitamin', 'Omega-3'],
                foods: {
                    increase: ['Lean protein', 'Whole grains', 'Vegetables', 'Fruits'],
                    decrease: ['Processed foods', 'Sugary drinks'],
                    avoid: ['Trans fats', 'Excessive sodium']
                }
            },
            reasoning: 'Based on age, activity level, and fitness goals',
            generatedAt: new Date()
        });

        return recommendation;
    }

    // Helper: Generate meals
    private async generateMeals(days: number, recommendations: any, restrictions: any): Promise<any[]> {
        const meals = [];
        const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

        for (let day = 1; day <= days; day++) {
            for (const type of mealTypes) {
                meals.push({
                    id: `meal_${day}_${type}`,
                    day,
                    mealType: type,
                    recipes: await this.selectRecipes(type, recommendations, restrictions),
                    nutrition: this.calculateMealNutrition(type, recommendations)
                });
            }
        }

        return meals;
    }

    // Helper: Select recipes
    private async selectRecipes(mealType: string, recommendations: any, restrictions: any): Promise<any[]> {
        // In production, use AI to select optimal recipes
        const recipes = await Recipe.find({ category: mealType }).limit(2);
        return recipes.map(r => r.toObject());
    }

    // Helper: Calculate meal nutrition
    private calculateMealNutrition(mealType: string, recommendations: any): any {
        const dailyCalories = recommendations.recommendations.dailyCalories;
        const mealCalories = {
            breakfast: dailyCalories * 0.25,
            lunch: dailyCalories * 0.35,
            dinner: dailyCalories * 0.30,
            snack: dailyCalories * 0.10
        };

        return {
            calories: mealCalories[mealType as keyof typeof mealCalories] || 0,
            protein: 0,
            carbs: 0,
            fats: 0
        };
    }

    // Helper: Calculate total nutrition
    private calculateTotalNutrition(consumed: any[]): any {
        return consumed.reduce((total, item) => ({
            calories: total.calories + (item.nutrition?.calories || 0),
            protein: total.protein + (item.nutrition?.protein || 0),
            carbs: total.carbs + (item.nutrition?.carbs || 0),
            fats: total.fats + (item.nutrition?.fats || 0)
        }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
    }

    // Helper: Aggregate ingredients
    private async aggregateIngredients(meals: any[]): Promise<any[]> {
        const ingredientMap = new Map();

        meals.forEach(meal => {
            meal.recipes?.forEach((recipe: any) => {
                recipe.ingredients?.forEach((ing: any) => {
                    const key = ing.name.toLowerCase();
                    if (ingredientMap.has(key)) {
                        const existing = ingredientMap.get(key);
                        existing.amount += ing.amount;
                    } else {
                        ingredientMap.set(key, {
                            ingredient: ing.name,
                            amount: ing.amount,
                            unit: ing.unit,
                            category: ing.category || 'Other',
                            checked: false
                        });
                    }
                });
            });
        });

        return Array.from(ingredientMap.values());
    }

    // Helper: Estimate cost
    private estimateTotalCost(items: any[]): number {
        return items.reduce((total, item) => total + (item.estimatedCost || 5), 0);
    }

    // Helper: Update plan adherence
    private async updatePlanAdherence(planId: string): Promise<void> {
        const plan = await MealPlan.findOne({ id: planId });
        if (!plan) return;

        const tracked = await MealTracking.countDocuments({ planId });
        const total = plan.meals.length;
        const adherence = Math.round((tracked / total) * 100);

        await MealPlan.updateOne({ id: planId }, { $set: { adherence } });
    }
}

export const nutritionService = new NutritionService();
