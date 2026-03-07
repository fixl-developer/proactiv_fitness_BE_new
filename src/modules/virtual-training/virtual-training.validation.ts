import Joi from 'joi';

export const createSessionSchema = Joi.object({
    title: Joi.string().required(),
    type: Joi.string().valid('live', 'recorded').required(),
    instructorId: Joi.string().required(),
    streamUrl: Joi.string().uri(),
    scheduledAt: Joi.date(),
    duration: Joi.number().required()
});
