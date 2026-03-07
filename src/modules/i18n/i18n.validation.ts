import Joi from 'joi'; export const setTranslationSchema = Joi.object({ key: Joi.string().required(), language: Joi.string().required(), value: Joi.string().required(), namespace: Joi.string() });
