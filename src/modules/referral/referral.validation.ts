import Joi from 'joi'; export const createReferralSchema = Joi.object({ referrerId: Joi.string().required(), referredId: Joi.string().required(), reward: Joi.number() });
