import { SmartNutritionModel } from './smart-nutrition.model';
import aiService from '@shared/services/ai.service';
import { AIPromptService } from '@shared/services/ai-prompt.service';
import logger from '@shared/utils/logger.util';

export class SmartNutritionService {
    // ─── AI-Generated Meal Plan ────────────────────────────────
    async generateMealPlan(planData: any): Promise<any> {
        try {
            const prompt = AIPromptService.mealPlan({
                childId: planData.childId,
                age: planData.age,
                weight: planData.weight,
                activityLevel: planData.activityLevel,
                dietaryRestrictions: planData.dietaryRestrictions,
                goals: planData.goals,
                duration: planData.duration || 7,
            });

            const aiResult = await aiService.jsonCompletion<{
                meals: any[];
                dailyTotals: { avgCalories: number; avgProtein: number; avgCarbs: number; avgFats: number };
                notes: string;
                hydrationTip: string;
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'smart-nutrition',
                temperature: 0.7,
                maxTokens: 3000,
            });

            const plan = {
                ...planData,
                type: 'meal-plan',
                meals: aiResult.meals,
                macros: {
                    protein: aiResult.dailyTotals.avgProtein,
                    carbs: aiResult.dailyTotals.avgCarbs,
                    fats: aiResult.dailyTotals.avgFats,
                },
                dailyTotals: aiResult.dailyTotals,
                notes: aiResult.notes,
                hydrationTip: aiResult.hydrationTip,
                aiPowered: true,
                createdAt: new Date(),
            };

            await SmartNutritionModel.create(plan);

            logger.info(`Smart Nutrition: Generated ${aiResult.meals.length}-day meal plan for child ${planData.childId}`);

            return plan;
        } catch (error: any) {
            logger.error(`Smart Nutrition meal plan generation failed:`, error.message);

            // Fallback to basic plan
            const fallbackPlan = {
                ...planData,
                type: 'meal-plan',
                meals: this.generateFallbackMeals(planData.duration || 7),
                macros: { protein: 80, carbs: 200, fats: 60 },
                notes: 'AI-generated plan unavailable. Showing basic template.',
                aiPowered: false,
                createdAt: new Date(),
            };

            await SmartNutritionModel.create(fallbackPlan);
            return fallbackPlan;
        }
    }

    // ─── Get Meal Plans ────────────────────────────────────────
    async getMealPlans(childId: string): Promise<any[]> {
        return SmartNutritionModel.find({ childId, type: 'meal-plan' }).sort({ createdAt: -1 });
    }

    // ─── Track Nutrition ───────────────────────────────────────
    async trackNutrition(trackingData: any): Promise<any> {
        const tracking = {
            ...trackingData,
            type: 'tracking',
            trackedAt: new Date(),
            createdAt: new Date(),
        };

        await SmartNutritionModel.create(tracking);
        return tracking;
    }

    // ─── AI-Powered Nutrition Recommendations ──────────────────
    async getNutritionRecommendations(childId: string): Promise<any> {
        try {
            // Fetch tracking history and current plan
            const trackingHistory = await SmartNutritionModel.find({
                childId,
                type: 'tracking',
            })
                .sort({ createdAt: -1 })
                .limit(14)
                .lean();

            const currentPlan = await SmartNutritionModel.findOne({
                childId,
                type: 'meal-plan',
            })
                .sort({ createdAt: -1 })
                .lean();

            const prompt = AIPromptService.nutritionRecommendations({
                childId,
                trackingHistory,
                currentPlan,
            });

            const result = await aiService.jsonCompletion<{
                recommendations: Array<{
                    category: string;
                    recommendation: string;
                    priority: string;
                    reason: string;
                }>;
                macroTargets: { protein: number; carbs: number; fats: number; calories: number };
                deficiencies: string[];
                improvements: string;
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'smart-nutrition',
                temperature: 0.6,
            });

            logger.info(`Smart Nutrition: Generated ${result.recommendations.length} recommendations for child ${childId}`);

            return {
                childId,
                ...result,
                generatedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Smart Nutrition recommendations failed for child ${childId}:`, error.message);
            return {
                childId,
                recommendations: [
                    { category: 'General', recommendation: 'Maintain a balanced diet with proteins, carbs, and healthy fats', priority: 'high', reason: 'Essential for young athlete development' },
                    { category: 'Hydration', recommendation: 'Drink at least 6-8 glasses of water daily', priority: 'high', reason: 'Critical for athletic performance' },
                    { category: 'Recovery', recommendation: 'Include protein-rich snacks after training', priority: 'medium', reason: 'Supports muscle recovery' },
                ],
                macroTargets: { protein: 80, carbs: 200, fats: 60, calories: 1800 },
                deficiencies: [],
                improvements: 'AI recommendations unavailable. Showing general guidance.',
                generatedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── AI-Generated Grocery List ─────────────────────────────
    async generateGroceryList(mealPlanId: string): Promise<any> {
        try {
            const mealPlan = await SmartNutritionModel.findOne({
                $or: [{ _id: mealPlanId }, { mealPlanId }],
                type: 'meal-plan',
            }).lean();

            if (!mealPlan) {
                return {
                    mealPlanId,
                    items: [],
                    message: 'Meal plan not found. Please generate a meal plan first.',
                    aiPowered: false,
                };
            }

            const prompt = AIPromptService.groceryList({ mealPlan: mealPlan.meals });

            const result = await aiService.jsonCompletion<{
                items: Array<{ name: string; quantity: string; category: string; estimatedCost: number }>;
                totalEstimatedCost: number;
                shoppingTips: string[];
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'smart-nutrition',
                temperature: 0.5,
            });

            logger.info(`Smart Nutrition: Generated grocery list with ${result.items.length} items`);

            return {
                mealPlanId,
                ...result,
                generatedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Smart Nutrition grocery list failed:`, error.message);
            return {
                mealPlanId,
                items: [
                    { name: 'Chicken Breast', quantity: '2 kg', category: 'Protein', estimatedCost: 15 },
                    { name: 'Brown Rice', quantity: '1 kg', category: 'Grains', estimatedCost: 5 },
                    { name: 'Mixed Vegetables', quantity: '1 kg', category: 'Produce', estimatedCost: 8 },
                    { name: 'Eggs', quantity: '12 pieces', category: 'Protein', estimatedCost: 6 },
                    { name: 'Fruits (mixed)', quantity: '2 kg', category: 'Produce', estimatedCost: 10 },
                ],
                totalEstimatedCost: 44,
                shoppingTips: ['Buy seasonal produce for better prices'],
                generatedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── AI-Generated Recipes ──────────────────────────────────
    async getRecipes(dietary?: string): Promise<any> {
        try {
            const prompt = AIPromptService.recipes({
                dietary,
                ageGroup: 'youth athletes',
            });

            const result = await aiService.jsonCompletion<{
                recipes: Array<{
                    name: string;
                    category: string;
                    prepTime: string;
                    cookTime: string;
                    servings: number;
                    difficulty: string;
                    ingredients: Array<{ item: string; amount: string }>;
                    instructions: string[];
                    nutrition: { calories: number; protein: number; carbs: number; fats: number };
                    kidFriendlyRating: number;
                }>;
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'smart-nutrition',
                temperature: 0.8,
                maxTokens: 3000,
            });

            logger.info(`Smart Nutrition: Generated ${result.recipes.length} recipes (dietary: ${dietary || 'any'})`);

            return {
                dietary: dietary || 'all',
                recipes: result.recipes,
                generatedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Smart Nutrition recipes failed:`, error.message);
            return {
                dietary: dietary || 'all',
                recipes: [
                    { name: 'Grilled Chicken with Rice', category: 'lunch', prepTime: '15 mins', cookTime: '20 mins', servings: 4, difficulty: 'easy', ingredients: [], instructions: [], nutrition: { calories: 450, protein: 35, carbs: 40, fats: 12 }, kidFriendlyRating: 4 },
                    { name: 'Vegetable Stir Fry', category: 'dinner', prepTime: '10 mins', cookTime: '15 mins', servings: 2, difficulty: 'easy', ingredients: [], instructions: [], nutrition: { calories: 280, protein: 8, carbs: 35, fats: 10 }, kidFriendlyRating: 3 },
                    { name: 'Banana Protein Smoothie', category: 'snack', prepTime: '5 mins', cookTime: '0 mins', servings: 1, difficulty: 'easy', ingredients: [], instructions: [], nutrition: { calories: 220, protein: 20, carbs: 30, fats: 5 }, kidFriendlyRating: 5 },
                ],
                generatedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Fallback Meal Generator ───────────────────────────────
    private generateFallbackMeals(duration: number): any[] {
        const meals = [];
        const breakfasts = ['Oatmeal with berries', 'Scrambled eggs with toast', 'Yogurt parfait', 'Whole grain pancakes', 'Smoothie bowl', 'Cereal with milk', 'Banana bread'];
        const lunches = ['Grilled chicken with rice', 'Turkey sandwich', 'Pasta with vegetables', 'Fish tacos', 'Chicken wrap', 'Stir fry noodles', 'Soup and bread'];
        const dinners = ['Salmon with vegetables', 'Beef stir fry', 'Chicken curry', 'Grilled fish with salad', 'Pasta bolognese', 'Steak with potatoes', 'Vegetable curry'];

        for (let i = 0; i < duration; i++) {
            meals.push({
                day: i + 1,
                breakfast: breakfasts[i % breakfasts.length],
                lunch: lunches[i % lunches.length],
                dinner: dinners[i % dinners.length],
                snacks: ['Protein bar', 'Fresh fruit'],
            });
        }
        return meals;
    }
}
