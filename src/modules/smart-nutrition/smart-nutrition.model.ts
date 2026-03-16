import mongoose, { Schema, Document } from 'mongoose';

const SmartNutritionSchema = new Schema({
    type: { type: String, enum: ['meal-plan', 'tracking', 'recipe'] },
    childId: String,
    duration: Number,
    meals: [Schema.Types.Mixed],
    macros: {
        protein: Number,
        carbs: Number,
        fats: Number
    },
    mealPlanId: String,
    items: [Schema.Types.Mixed],
    dietary: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const SmartNutritionModel = mongoose.model('SmartNutrition', SmartNutritionSchema);
