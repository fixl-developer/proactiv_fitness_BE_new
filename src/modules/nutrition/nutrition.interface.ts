// Smart Nutrition Planner Interfaces
export interface IMealPlan {
    id: string;
    studentId: string;
    programId?: string;
    name: string;
    duration: number; // days
    startDate: Date;
    endDate: Date;
    goals: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
        fiber?: number;
    };
    meals: IMeal[];
    generatedBy: 'ai' | 'manual' | 'template';
    status: 'active' | 'completed' | 'paused';
    adherence?: number; // 0-100
}

export interface IMeal {
    id: string;
    planId: string;
    day: number;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre-workout' | 'post-workout';
    time?: string;
    recipes: IRecipe[];
    nutrition: INutritionInfo;
    notes?: string;
}

export interface IRecipe {
    id: string;
    name: string;
    description: string;
    category: string[];
    cuisine?: string;
    prepTime: number; // minutes
    cookTime: number;
    servings: number;
    difficulty: 'easy' | 'medium' | 'hard';
    ingredients: IIngredient[];
    instructions: string[];
    nutrition: INutritionInfo;
    imageUrl?: string;
    videoUrl?: string;
    tags: string[];
    allergens: string[];
    dietaryInfo: {
        vegetarian: boolean;
        vegan: boolean;
        glutenFree: boolean;
        dairyFree: boolean;
        nutFree: boolean;
        halal: boolean;
        kosher: boolean;
    };
}

export interface IIngredient {
    name: string;
    amount: number;
    unit: string;
    category?: string;
    optional?: boolean;
    substitutes?: string[];
}

export interface INutritionInfo {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    cholesterol?: number;
    vitamins?: Record<string, number>;
    minerals?: Record<string, number>;
}

export interface IMealTracking {
    id: string;
    studentId: string;
    planId?: string;
    date: Date;
    mealType: string;
    consumed: {
        recipeId?: string;
        customFood?: string;
        portion: number;
        nutrition: INutritionInfo;
    }[];
    totalNutrition: INutritionInfo;
    photos?: string[];
    notes?: string;
    mood?: 'great' | 'good' | 'okay' | 'poor';
    energy?: number; // 1-10
}

export interface IGroceryList {
    id: string;
    planId: string;
    studentId: string;
    weekStartDate: Date;
    items: IGroceryItem[];
    totalCost?: number;
    status: 'pending' | 'shopping' | 'completed';
    generatedAt: Date;
}

export interface IGroceryItem {
    ingredient: string;
    amount: number;
    unit: string;
    category: string;
    checked: boolean;
    estimatedCost?: number;
    store?: string;
}

export interface IDietaryRestriction {
    studentId: string;
    allergies: string[];
    intolerances: string[];
    preferences: {
        vegetarian?: boolean;
        vegan?: boolean;
        pescatarian?: boolean;
        keto?: boolean;
        paleo?: boolean;
        lowCarb?: boolean;
        lowFat?: boolean;
        halal?: boolean;
        kosher?: boolean;
    };
    dislikes: string[];
    medicalConditions?: string[];
    notes?: string;
}

export interface INutritionRecommendation {
    studentId: string;
    basedOn: {
        age: number;
        weight: number;
        height: number;
        activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
        goals: string[];
        currentDiet?: any;
    };
    recommendations: {
        dailyCalories: number;
        macros: {
            protein: { grams: number; percentage: number };
            carbs: { grams: number; percentage: number };
            fats: { grams: number; percentage: number };
        };
        hydration: number; // liters
        meals: number; // per day
        timing: string[];
        supplements?: string[];
        foods: {
            increase: string[];
            decrease: string[];
            avoid: string[];
        };
    };
    reasoning: string;
    generatedAt: Date;
}

export interface INutritionEducation {
    id: string;
    title: string;
    category: 'basics' | 'sports' | 'weight-management' | 'supplements' | 'recipes' | 'myths';
    content: string;
    ageGroup: string[];
    readTime: number; // minutes
    imageUrl?: string;
    videoUrl?: string;
    resources: string[];
    quiz?: {
        questions: Array<{
            question: string;
            options: string[];
            correctAnswer: number;
            explanation: string;
        }>;
    };
}
