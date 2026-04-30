import { SmartNutritionService } from './smart-nutrition.service';

describe('SmartNutritionService', () => {
    let service: SmartNutritionService;

    beforeEach(() => {
        service = new SmartNutritionService();
    });

    describe('generateMealPlan', () => {
        it('should generate a meal plan', async () => {
            const plan = await service.generateMealPlan({
                childId: 'child123',
                duration: 7,
                dietaryRestrictions: [],
                fitnessGoals: ['muscle-building']
            });
            expect(plan).toBeDefined();
            expect(plan.meals.length).toBe(7);
        });
    });

    describe('trackNutrition', () => {
        it('should track nutrition', async () => {
            const tracking = await service.trackNutrition({
                childId: 'child123',
                mealType: 'breakfast',
                calories: 500,
                protein: 30,
                carbs: 50,
                fats: 15
            });
            expect(tracking).toBeDefined();
            expect(tracking.calories).toBe(500);
        });
    });

    describe('getRecipes', () => {
        it('should get recipes', async () => {
            const recipes = await service.getRecipes('high-protein');
            expect(recipes).toBeDefined();
            expect(recipes.length).toBeGreaterThan(0);
        });
    });
});
