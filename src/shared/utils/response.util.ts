import { Response } from 'express';
import { IApiResponse } from '@shared/interfaces/common.interface';
import { HTTP_STATUS } from '@shared/constants';

export class ResponseUtil {
    static success<T>(
        res: Response,
        data: T,
        message: string = 'Success',
        statusCode: number = HTTP_STATUS.OK
    ): Response {
        const response: IApiResponse<T> = {
            success: true,
            message,
            data,
            timestamp: new Date(),
        };
        return res.status(statusCode).json(response);
    }

    static error(
        res: Response,
        message: string = 'Error',
        error?: any,
        statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR
    ): Response {
        const response: IApiResponse = {
            success: false,
            message,
            error: process.env.NODE_ENV === 'development' ? error : undefined,
            timestamp: new Date(),
        };
        return res.status(statusCode).json(response);
    }

    static created<T>(res: Response, data: T, message: string = 'Created successfully'): Response {
        return this.success(res, data, message, HTTP_STATUS.CREATED);
    }

    static noContent(res: Response): Response {
        return res.status(HTTP_STATUS.NO_CONTENT).send();
    }

    static badRequest(res: Response, message: string = 'Bad request', error?: any): Response {
        return this.error(res, message, error, HTTP_STATUS.BAD_REQUEST);
    }

    static unauthorized(res: Response, message: string = 'Unauthorized'): Response {
        return this.error(res, message, null, HTTP_STATUS.UNAUTHORIZED);
    }

    static forbidden(res: Response, message: string = 'Forbidden'): Response {
        return this.error(res, message, null, HTTP_STATUS.FORBIDDEN);
    }

    static notFound(res: Response, message: string = 'Resource not found'): Response {
        return this.error(res, message, null, HTTP_STATUS.NOT_FOUND);
    }

    static conflict(res: Response, message: string = 'Conflict', error?: any): Response {
        return this.error(res, message, error, HTTP_STATUS.CONFLICT);
    }

    static validationError(res: Response, errors: any): Response {
        return this.error(res, 'Validation failed', errors, HTTP_STATUS.UNPROCESSABLE_ENTITY);
    }
}
