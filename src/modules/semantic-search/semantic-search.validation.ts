import Joi from 'joi'; export const semanticSearchSchema = Joi.object({ query: Joi.string().required(), context: Joi.string(), topK: Joi.number() });
