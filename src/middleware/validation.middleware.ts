import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ResponseUtil } from '@shared/utils/response.util';

/**
 * Internal helper: read validationResult and respond with errors if any.
 */
function respondWithValidationErrors(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    const extractedErrors = errors.array().map((err: any) => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value,
    }));
    return ResponseUtil.validationError(res, extractedErrors);
}

/**
 * Dual-mode validate.
 *
 *  Mode 1 (factory): `validate([body('x').isString(), ...])` returns a middleware
 *  that runs the given validation chains then checks for errors. This is the
 *  original signature used in cms.routes and many newer routes.
 *
 *  Mode 2 (direct middleware): `validate` itself can be passed as an Express
 *  middleware in a route array (e.g. `[body(...), body(...), validate, controller]`).
 *  In this mode it just inspects the express-validator result that the previous
 *  chains attached to the request, and either calls next() or returns 422.
 *  This is how rule.routes / scheduling.routes / iam-rbac.routes use it. Without
 *  this dual-mode, those route arrays hang because `validate` (the factory)
 *  was passed where a middleware was expected, and Express called the factory
 *  as `validate(req, res, next)` which returns *another* middleware function
 *  instead of advancing the chain.
 */
export function validate(...args: any[]): any {
    // Mode 2: direct middleware — first arg looks like an Express Request
    if (args.length >= 3 && args[0] && typeof args[0] === 'object' && 'headers' in args[0] && typeof args[2] === 'function') {
        const [req, res, next] = args as [Request, Response, NextFunction];
        return respondWithValidationErrors(req, res, next);
    }

    // Mode 1: factory — return a middleware that runs the validations
    const validations = (args[0] || []) as ValidationChain[];
    return async (req: Request, res: Response, next: NextFunction) => {
        await Promise.all(validations.map((validation) => validation.run(req)));
        return respondWithValidationErrors(req, res, next);
    };
}

// Export alias for backward compatibility
export const validationMiddleware = validate;
