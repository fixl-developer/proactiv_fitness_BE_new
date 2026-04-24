import { Request, Response, NextFunction } from 'express';
import { AuditVaultModel } from '@modules/audit-vault/audit-vault.model';
import { v4 as uuidv4 } from 'uuid';
import logger from '@shared/utils/logger.util';

/**
 * Fields that must be stripped from request bodies before audit logging.
 * These are sensitive values that should never appear in audit trails.
 */
const SENSITIVE_FIELDS = [
    'password',
    'confirmPassword',
    'currentPassword',
    'newPassword',
    'token',
    'refreshToken',
    'creditCard',
    'creditCardNumber',
    'cvv',
    'cardNumber',
    'cardCvv',
    'ssn',
    'secret',
];

/**
 * Recursively remove sensitive fields from an object.
 * Returns a sanitized deep copy — the original object is never mutated.
 */
export function sanitizeBody(body: Record<string, any>): Record<string, any> {
    if (!body || typeof body !== 'object') {
        return body;
    }

    if (Array.isArray(body)) {
        return body.map((item) => sanitizeBody(item));
    }

    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(body)) {
        if (SENSITIVE_FIELDS.includes(key)) {
            sanitized[key] = '[REDACTED]';
        } else if (value && typeof value === 'object') {
            sanitized[key] = sanitizeBody(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}

/**
 * Persist an audit log entry to the database.
 * This is fire-and-forget — callers should catch errors themselves.
 */
export async function saveAuditLog(entry: {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    changes: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
    tenantId?: string;
}): Promise<void> {
    try {
        await AuditVaultModel.create({
            auditId: uuidv4(),
            tenantId: entry.tenantId || 'default',
            userId: entry.userId,
            action: entry.action,
            entityType: entry.entityType,
            entityId: entry.entityId,
            changes: entry.changes,
            ipAddress: entry.ipAddress,
            userAgent: entry.userAgent,
        });
    } catch (error) {
        logger.error('Failed to save audit log', { error, entry });
    }
}

/**
 * Express middleware factory that automatically logs an audit event
 * after a successful JSON response is sent.
 *
 * Usage:
 *   router.post('/users', auditLog('USER_CREATE', 'User'), controller.create);
 */
export const auditLog = (action: string, entityType: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Store the original res.json so we can intercept it
        const originalJson = res.json.bind(res);

        res.json = (body: any) => {
            // Only log for successful responses (2xx)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const auditEntry = {
                    userId: (req as any).user?.id || 'anonymous',
                    action,
                    entityType,
                    entityId: req.params?.id || body?.data?.id || body?.data?._id || 'N/A',
                    changes: {
                        method: req.method,
                        path: req.originalUrl,
                        body: sanitizeBody(req.body),
                        statusCode: res.statusCode,
                    },
                    ipAddress: req.ip || req.socket?.remoteAddress || '',
                    userAgent: req.get('User-Agent') || '',
                    timestamp: new Date(),
                    tenantId: (req as any).user?.tenantId,
                };

                // Fire and forget — never block the response
                saveAuditLog(auditEntry).catch((err) =>
                    logger.error('Audit log fire-and-forget error', { err })
                );
            }

            return originalJson(body);
        };

        next();
    };
};
