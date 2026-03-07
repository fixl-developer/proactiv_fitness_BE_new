export interface IMealPlan {
    _id?: string;
    userId: string;
    name: string;
    targetCalories: number;
    macros: {
        protein: number;
        carbs: number;
        fats: number;
    };
    meals: IMeal[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IMeal {
    name: string;
    time: string;
    foods: IFood[];
    calories: number;
}

export interface IFood {
    name: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}
