import { Request, Response, NextFunction } from 'express';
import { AppError } from '@middleware/error.middleware';
import { HTTP_STATUS } from '@shared/constants';
import { User } from './user.model';
import logger from '@shared/utils/logger.util';

// ────────────────────────────────────────────────────────────────────────────
// In-memory store for per-user rate limiting.
// In production this should be backed by Redis; for a single-process deploy
// a Map is sufficient and avoids an extra dependency.
// ────────────────────────────────────────────────────────────────────────────

interface RateLimitEntry {
    count: number;
    windowStart: number;
}

const userRateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate-limit requests per authenticated user (not just per IP).
 *
 * @param maxRequests  Maximum number of requests allowed inside the window.
 * @param windowMs     Length of the sliding window in milliseconds.
 */
export const userRateLimit = (maxRequests: number, windowMs: number) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) {
            // If the user is not authenticated, fall through — other
            // middleware (e.g. IP-based rate limiting) should handle it.
            return next();
        }

        const now = Date.now();
        const key = `${userId}:${req.baseUrl}`;
        let entry = userRateLimitStore.get(key);

        if (!entry || now - entry.windowStart > windowMs) {
            // Start a fresh window
            entry = { count: 1, windowStart: now };
            userRateLimitStore.set(key, entry);
            return next();
        }

        entry.count += 1;

        if (entry.count > maxRequests) {
            const retryAfterMs = windowMs - (now - entry.windowStart);
            res.set('Retry-After', String(Math.ceil(retryAfterMs / 1000)));
            logger.warn('User rate limit exceeded', { userId, path: req.baseUrl });
            return next(
                new AppError(
                    'Too many requests. Please try again later.',
                    HTTP_STATUS.TOO_MANY_REQUESTS || 429
                )
            );
        }

        return next();
    };
};

/**
 * Validate that the requesting user still has an active session stored in
 * the database.  This catches cases where a token is valid (not expired)
 * but the session was explicitly removed (e.g. forced logout, session limit).
 */
export const validateSession = () => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return next(new AppError('Authentication required', HTTP_STATUS.UNAUTHORIZED));
            }

            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return next(new AppError('No token provided', HTTP_STATUS.UNAUTHORIZED));
            }

            const token = authHeader.substring(7);

            const user = await User.findById(userId).select('+activeSessions');
            if (!user) {
                return next(new AppError('User not found', HTTP_STATUS.UNAUTHORIZED));
            }

            // If the user has activeSessions tracking, verify this token is in the list
            const sessions = (user as any).activeSessions;
            if (sessions && Array.isArray(sessions) && sessions.length > 0) {
                const sessionExists = sessions.some(
                    (s: any) => s.token === token
                );
                if (!sessionExists) {
                    return next(
                        new AppError(
                            'Session is no longer valid. Please log in again.',
                            HTTP_STATUS.UNAUTHORIZED
                        )
                    );
                }
            }

            next();
        } catch (error) {
            logger.error('Session validation error', { error });
            next(new AppError('Session validation failed', HTTP_STATUS.INTERNAL_SERVER_ERROR || 500));
        }
    };
};

/**
 * GDPR consent check middleware.
 *
 * Ensures the authenticated user has granted the specified consent type
 * before the request is allowed through.  Consent flags are stored in
 * user.metadata.consents (an object keyed by consent type).
 */
export const requireConsent = (consentType: string) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return next(new AppError('Authentication required', HTTP_STATUS.UNAUTHORIZED));
            }

            const user = await User.findById(userId).select('metadata');
            if (!user) {
                return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
            }

            const consents = (user as any).metadata?.consents;
            if (!consents || !consents[consentType]) {
                return next(
                    new AppError(
                        `Consent required: ${consentType}. Please accept the required terms before proceeding.`,
                        HTTP_STATUS.FORBIDDEN
                    )
                );
            }

            next();
        } catch (error) {
            logger.error('Consent check error', { error, consentType });
            next(new AppError('Consent check failed', HTTP_STATUS.INTERNAL_SERVER_ERROR || 500));
        }
    };
};

/**
 * Sanitize all string values in the request body to prevent basic XSS
 * and NoSQL injection attacks.
 *
 * - Strips HTML tags
 * - Removes MongoDB operator keys ($gt, $lt, etc.)
 */
export const sanitizeInput = () => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (req.body && typeof req.body === 'object') {
            req.body = deepSanitize(req.body);
        }
        if (req.query && typeof req.query === 'object') {
            req.query = deepSanitize(req.query) as any;
        }
        if (req.params && typeof req.params === 'object') {
            req.params = deepSanitize(req.params) as any;
        }
        next();
    };
};

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function deepSanitize(obj: any): any {
    if (typeof obj === 'string') {
        // Strip HTML tags
        let clean = obj.replace(/<[^>]*>/g, '');
        // Remove null bytes
        clean = clean.replace(/\0/g, '');
        return clean;
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => deepSanitize(item));
    }

    if (obj && typeof obj === 'object') {
        const sanitized: Record<string, any> = {};
        for (const [key, value] of Object.entries(obj)) {
            // Block MongoDB operator injection
            if (key.startsWith('$')) {
                continue;
            }
            sanitized[key] = deepSanitize(value);
        }
        return sanitized;
    }

    return obj;
}
