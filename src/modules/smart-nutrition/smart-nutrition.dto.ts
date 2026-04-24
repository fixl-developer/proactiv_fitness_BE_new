export interface GenerateMealPlanDTO {
    childId: string;
    duration: number;
    dietaryRestrictions: string[];
    fitnessGoals: string[];
}

export interface TrackNutritionDTO {
    childId: string;
    mealType: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

export interface GenerateGroceryListDTO {
    mealPlanId: string;
}
