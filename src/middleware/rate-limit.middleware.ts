import rateLimit from 'express-rate-limit';
import { RATE_LIMIT_WINDOW, RATE_LIMIT_MAX } from '@shared/constants';

export const apiLimiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW,
    max: RATE_LIMIT_MAX,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requests per window (increased for development)
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: true,
});

export const strictLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    message: 'Rate limit exceeded',
});

// Alias for backward compatibility (instance)
export const rateLimitMiddleware = apiLimiter;

// Factory function for custom rate limit options
export const createRateLimitMiddleware = (options: { windowMs: number; max: number }) => {
    return rateLimit({
        windowMs: options.windowMs,
        max: options.max,
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
    });
};
