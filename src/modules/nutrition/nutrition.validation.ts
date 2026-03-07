import Joi from 'joi';

export const createMealPlanSchema = Joi.object({
    userId: Joi.string().required(),
    name: Joi.string().required(),
    targetCalories: Joi.number().required(),
    macros: Joi.object({
        protein: Joi.number(),
        carbs: Joi.number(),
        fats: Joi.number()
    }),
    meals: Joi.array()
});
