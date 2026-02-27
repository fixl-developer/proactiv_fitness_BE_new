import { Request, Response } from 'express';
import { ResponseUtil } from '@shared/utils/response.util';
import { asyncHandler } from '@shared/utils/async-handler.util';

export abstract class BaseController {
    protected sendSuccess = (res: Response, data: any, message: string = 'Success') => {
        return ResponseUtil.success(res, data, message);
    };

    protected sendCreated = (res: Response, data: any, message: string = 'Created successfully') => {
        return ResponseUtil.created(res, data, message);
    };

    protected sendError = (res: Response, message: string, error?: any, statusCode?: number) => {
        return ResponseUtil.error(res, message, error, statusCode);
    };

    protected sendNotFound = (res: Response, message: string = 'Resource not found') => {
        return ResponseUtil.notFound(res, message);
    };

    protected sendBadRequest = (res: Response, message: string = 'Bad request', error?: any) => {
        return ResponseUtil.badRequest(res, message, error);
    };

    protected sendUnauthorized = (res: Response, message: string = 'Unauthorized') => {
        return ResponseUtil.unauthorized(res, message);
    };

    protected sendForbidden = (res: Response, message: string = 'Forbidden') => {
        return ResponseUtil.forbidden(res, message);
    };

    protected wrap = (fn: Function) => {
        return asyncHandler(async (req: Request, res: Response) => {
            await fn.call(this, req, res);
        });
    };
}
