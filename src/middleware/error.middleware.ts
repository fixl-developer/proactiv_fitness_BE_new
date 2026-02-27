import { Request, Response, NextFunction } from 'express';
import logger from '@shared/utils/logger.util';
import { ResponseUtil } from '@shared/utils/response.util';
import { HTTP_STATUS } from '@shared/constants';

export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
    });

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new AppError(message, HTTP_STATUS.NOT_FOUND);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `Duplicate field value: ${field}`;
        error = new AppError(message, HTTP_STATUS.CONFLICT);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors)
            .map((val: any) => val.message)
            .join(', ');
        error = new AppError(message, HTTP_STATUS.BAD_REQUEST);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = new AppError(message, HTTP_STATUS.UNAUTHORIZED);
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = new AppError(message, HTTP_STATUS.UNAUTHORIZED);
    }

    return ResponseUtil.error(
        res,
        error.message || 'Internal server error',
        process.env.NODE_ENV === 'development' ? err.stack : undefined,
        error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
};

export const notFoundHandler = (req: Request, res: Response) => {
    return ResponseUtil.notFound(res, `Route ${req.originalUrl} not found`);
};
