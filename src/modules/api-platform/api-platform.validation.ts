import Joi from 'joi'; export const createApiKeySchema = Joi.object({ name: Joi.string().required(), userId: Joi.string() });
