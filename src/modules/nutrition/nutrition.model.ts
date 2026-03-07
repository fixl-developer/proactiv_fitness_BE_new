import mongoose, { Schema, Document } from 'mongoose';

const NutritionInfoSchema = new Schema({
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fats: { type: Number, required: true },
  fiber: Number,
  sugar: Number,
  sodium: Number,
  cholesterol: Number,
  vitamins: Schema.Types.Mixed,
  minerals: Schema.Types.Mixed
}, { _id: false });

const MealPlanSchema = new Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true, index: true },
  programId: String,
  name: { type: String, required: true },
  duration: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  goals: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number,
    fiber: Number
  },
  meals: [Schema.Types.Mixed],
  generatedBy: { type: String, enum: ['ai', 'manual', 'template'], default: 'ai' },
  status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
  adherence: { type: Number, min: 0, max: 100 }
}, { timestamps: true });

const RecipeSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  category: [String],
  cuisine: String,
  prepTime: Number,
  cookTime: Number,
  servings: { type: Number, default: 1 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  ingredients: [{
    name: String,
    amount: Number,
    unit: String,
    category: String,
    optional: Boolean,
    substitutes: [String]
  }],
  instructions: [String],
  nutrition: NutritionInfoSchema,
  imageUrl: String,
  videoUrl: String,
  tags: [String],
  allergens: [String],
  dietaryInfo: {
    vegetarian: Boolean,
    vegan: Boolean,
    glutenFree: Boolean,
    dairyFree: Boolean,
    nutFree: Boolean,
    halal: Boolean,
    kosher: Boolean
  }
}, { timestamps: true });

const MealTrackingSchema = new Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true, index: true },
  planId: String,
  date: { type: Date, required: true, index: true },
  mealType: { type: String, required: true },
  consumed: [{
    recipeId: String,
    customFood: String,
    portion: Number,
    nutrition: NutritionInfoSchema
  }],
  totalNutrition: NutritionInfoSchema,
  photos: [String],
  notes: String,
  mood: { type: String, enum: ['great', 'good', 'okay', 'poor'] },
  energy: { type: Number, min: 1, max: 10 }
}, { timestamps: true });

const GroceryListSchema = new Schema({
  id: { type: String, required: true, unique: true },
  planId: { type: String, required: true },
  studentId: { type: String, required: true, index: true },
  weekStartDate: { type: Date, required: true },
  items: [{
    ingredient: String,
    amount: Number,
    unit: String,
    category: String,
    checked: { type: Boolean, default: false },
    estimatedCost: Number,
    store: String
  }],
  totalCost: Number,
  status: { type: String, enum: ['pending', 'shopping', 'completed'], default: 'pending' }
}, { timestamps: true });

const DietaryRestrictionSchema = new Schema({
  studentId: { type: String, required: true, unique: true },
  allergies: [String],
  intolerances: [String],
  preferences: {
    vegetarian: Boolean,
    vegan: Boolean,
    pescatarian: Boolean,
    keto: Boolean,
    paleo: Boolean,
    lowCarb: Boolean,
    lowFat: Boolean,
    halal: Boolean,
    kosher: Boolean
  },
  dislikes: [String],
  medicalConditions: [String],
  notes: String
}, { timestamps: true });

const NutritionRecommendationSchema = new Schema({
  studentId: { type: String, required: true, index: true },
  basedOn: {
    age: Number,
    weight: Number,
    height: Number,
    activityLevel: String,
    goals: [String],
    currentDiet: Schema.Types.Mixed
  },
  recommendations: {
    dailyCalories: Number,
    macros: {
      protein: { grams: Number, percentage: Number },
      carbs: { grams: Number, percentage: Number },
      fats: { grams: Number, percentage: Number }
    },
    hydration: Number,
    meals: Number,
    timing: [String],
    supplements: [String],
    foods: {
      increase: [String],
      decrease: [String],
      avoid: [String]
    }
  },
  reasoning: String,
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const MealPlan = mongoose.model('MealPlan', MealPlanSchema);
export const Recipe = mongoose.model('Recipe', RecipeSchema);
export const MealTracking = mongoose.model('MealTracking', MealTrackingSchema);
export const GroceryList = mongoose.model('GroceryList', GroceryListSchema);
export const DietaryRestriction = mongoose.model('DietaryRestriction', DietaryRestrictionSchema);
export const NutritionRecommendation = mongoose.model('NutritionRecommendation', NutritionRecommendationSchema);
