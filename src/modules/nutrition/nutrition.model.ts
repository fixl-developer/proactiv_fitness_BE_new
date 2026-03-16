import { Schema, model } from 'mongoose';

const nutritionPlanSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: String,
    duration: Number,
    meals: [{ name: String, calories: Number, protein: Number, carbs: Number, fat: Number }],
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    category: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

nutritionPlanSchema.index({ userId: 1 });
nutritionPlanSchema.index({ name: 'text', description: 'text' });

export default model('NutritionPlan', nutritionPlanSchema);
