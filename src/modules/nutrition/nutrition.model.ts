import mongoose, { Schema } from 'mongoose';
import { IMealPlan } from './nutrition.interface';

const mealPlanSchema = new Schema<IMealPlan>({
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    targetCalories: { type: Number, required: true },
    macros: {
        protein: Number,
        carbs: Number,
        fats: Number
    },
    meals: [{
        name: String,
        time: String,
        foods: [{
            name: String,
            quantity: Number,
            unit: String,
            calories: Number,
            protein: Number,
            carbs: Number,
            fats: Number
        }],
        calories: Number
    }]
}, { timestamps: true });

export const MealPlan = mongoose.model<IMealPlan>('MealPlan', mealPlanSchema);
