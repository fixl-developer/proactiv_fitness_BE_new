import Joi from 'joi'; export const createTenantSchema = Joi.object({ name: Joi.string().required(), domain: Joi.string().required(), plan: Joi.string(), settings: Joi.object() });
