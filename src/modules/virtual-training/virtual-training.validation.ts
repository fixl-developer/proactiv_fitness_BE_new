import Joi from 'joi';

export const virtualTrainingValidation = {
    createSession: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().optional(),
        type: Joi.string().valid('live', 'on-demand', 'one-on-one').required(),
        programId: Joi.string().optional(),
        coachId: Joi.string().required(),
        scheduledStart: Joi.date().required(),
        scheduledEnd: Joi.date().required(),
        maxParticipants: Joi.number().min(1).max(1000).optional()
    })
};
