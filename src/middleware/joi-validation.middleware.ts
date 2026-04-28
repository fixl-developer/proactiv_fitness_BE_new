import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateBody = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map(d => d.message)
            });
            return;
        }
        next();
    };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error } = schema.validate(req.params, { abortEarly: false });
        if (error) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map(d => d.message)
            });
            return;
        }
        next();
    };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error } = schema.validate(req.query, { abortEarly: false });
        if (error) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map(d => d.message)
            });
            return;
        }
        next();
    };
};
