import Joi from 'joi';

export const nutritionValidation = {
    generatePlan: Joi.object({
        studentId: Joi.string().required(),
        programId: Joi.string().optional(),
        name: Joi.string().required(),
        duration: Joi.number().min(1).max(90).required(),
        startDate: Joi.date().required(),
        goals: Joi.object({
            calories: Joi.number().optional(),
            protein: Joi.number().optional(),
            carbs: Joi.number().optional(),
            fats: Joi.number().optional(),
            fiber: Joi.number().optional()
        }).optional()
    }),

    trackMeal: Joi.object({
        studentId: Joi.string().required(),
        planId: Joi.string().optional(),
        date: Joi.date().required(),
        mealType: Joi.string().required(),
        consumed: Joi.array().items(Joi.object({
            recipeId: Joi.string().optional(),
            customFood: Joi.string().optional(),
            portion: Joi.number().required(),
            nutrition: Joi.object().required()
        })).required(),
        photos: Joi.array().items(Joi.string()).optional(),
        notes: Joi.string().optional(),
        mood: Joi.string().valid('great', 'good', 'okay', 'poor').optional(),
        energy: Joi.number().min(1).max(10).optional()
    }),

    dietaryRestrictions: Joi.object({
        studentId: Joi.string().required(),
        allergies: Joi.array().items(Joi.string()).optional(),
        intolerances: Joi.array().items(Joi.string()).optional(),
        preferences: Joi.object().optional(),
        dislikes: Joi.array().items(Joi.string()).optional(),
        medicalConditions: Joi.array().items(Joi.string()).optional(),
        notes: Joi.string().optional()
    })
};
