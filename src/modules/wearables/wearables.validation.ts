import Joi from 'joi'; export const syncDataSchema = Joi.object({ userId: Joi.string().required(), deviceType: Joi.string().required(), heartRate: Joi.number(), steps: Joi.number() });
