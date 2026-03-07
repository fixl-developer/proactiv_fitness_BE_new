import Joi from 'joi';

export const wearablesValidation = {
    connectDevice: Joi.object({
        userId: Joi.string().required(),
        deviceType: Joi.string().valid('apple_watch', 'fitbit', 'garmin', 'samsung', 'other').required(),
        deviceName: Joi.string().required(),
        deviceId: Joi.string().required()
    })
};
