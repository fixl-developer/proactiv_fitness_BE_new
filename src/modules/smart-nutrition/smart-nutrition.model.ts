import mongoose, { Schema, Document } from 'mongoose';

export interface ISmartNutritionDocument extends Document {
    type: string;
    childId: string;
    parentId?: string;
    tenantId?: string;
    status?: string;
    duration?: number;
    meals?: any[];
    macros?: { protein: number; carbs: number; fats: number };
    dailyTotals?: any;
    notes?: string;
    hydrationTip?: string;
    mealPlanId?: string;
    items?: any[];
    dietary?: string;
    // Tracking fields
    date?: Date;
    mealType?: string;
    foodItems?: any[];
    calories?: number;
    waterIntake?: number;
    aiPowered?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const SmartNutritionSchema = new Schema({
    type: { type: String, enum: ['meal-plan', 'tracking', 'recipe', 'log', 'grocery-list'], default: 'meal-plan' },
    childId: { type: String, index: true },
    parentId: String,
    tenantId: String,
    status: { type: String, enum: ['active', 'paused', 'completed', 'draft'], default: 'active' },
    duration: Number,
    meals: [Schema.Types.Mixed],
    macros: {
        protein: Number,
        carbs: Number,
        fats: Number,
    },
    dailyTotals: Schema.Types.Mixed,
    notes: String,
    hydrationTip: String,
    mealPlanId: String,
    items: [Schema.Types.Mixed],
    dietary: String,
    // Tracking/logging fields
    date: Date,
    mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack', null] },
    foodItems: [Schema.Types.Mixed],
    calories: Number,
    waterIntake: { type: Number, default: 0 },
    aiPowered: { type: Boolean, default: false },
}, { timestamps: true });

SmartNutritionSchema.index({ childId: 1, type: 1 });
SmartNutritionSchema.index({ childId: 1, date: -1 });

export const SmartNutritionModel = mongoose.model<ISmartNutritionDocument>('SmartNutrition', SmartNutritionSchema);
