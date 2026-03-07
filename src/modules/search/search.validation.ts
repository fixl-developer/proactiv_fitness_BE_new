import Joi from 'joi'; export const searchSchema = Joi.object({ query: Joi.string().required(), filters: Joi.object(), page: Joi.number(), limit: Joi.number() });
