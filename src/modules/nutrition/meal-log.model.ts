import { Schema, model } from 'mongoose';

// Per-user meal log entry. Backs the user-facing /user/nutrition/meals CRUD.
const mealLogSchema = new Schema({
    userId: { type: String, required: true, index: true },
    mealType: { type: String, required: true },
    mealName: { type: String, required: true },
    calories: { type: Number, required: true, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fats: { type: Number, default: 0 },
    consumedAt: { type: Date, required: true },
    notes: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
});

mealLogSchema.index({ userId: 1, consumedAt: -1 });

export const MealLogModel = model('MealLog', mealLogSchema);
