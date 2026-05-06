import { Request, Response } from 'express';
import { BaseController } from '../../shared/base/base.controller';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';
import { TrainingResourceService } from './training-resource.service';

export class TrainingResourceController extends BaseController {
    private service: TrainingResourceService;

    constructor() {
        super();
        this.service = new TrainingResourceService();
    }

    list = asyncHandler(async (req: Request, res: Response) => {
        const {
            search,
            category,
            type,
            featured,
            includeInactive,
            page,
            limit,
        } = req.query as Record<string, string | undefined>;

        const data = await this.service.list({
            search: search || '',
            category: (category as any) || undefined,
            type: (type as any) || undefined,
            featured: typeof featured === 'string' ? featured === 'true' : undefined,
            includeInactive: includeInactive === 'true',
            page: page ? Math.max(1, parseInt(page, 10) || 1) : 1,
            limit: limit ? Math.min(200, Math.max(1, parseInt(limit, 10) || 50)) : 50,
        });
        return this.sendSuccess(res, data, 'Training resources retrieved');
    });

    getOne = asyncHandler(async (req: Request, res: Response) => {
        const doc = await this.service.getById(req.params.id);
        return this.sendSuccess(res, doc, 'Training resource retrieved');
    });

    create = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        const userName =
            (req.user as any)?.name ||
            ([(req.user as any)?.firstName, (req.user as any)?.lastName]
                .filter(Boolean)
                .join(' ')) ||
            (req.user as any)?.email ||
            '';
        const { title, description, url, type, category, tags, estimatedMinutes, featured } =
            req.body || {};
        if (!title || !description || !url) {
            throw new AppError(
                'title, description and url are required',
                HTTP_STATUS.BAD_REQUEST
            );
        }
        const created = await this.service.create(
            { title, description, url, type, category, tags, estimatedMinutes, featured },
            userId,
            userName
        );
        return this.sendCreated(res, created, 'Training resource created');
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        const updated = await this.service.update(req.params.id, req.body || {});
        return this.sendSuccess(res, updated, 'Training resource updated');
    });

    remove = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        const result = await this.service.delete(req.params.id);
        return this.sendSuccess(res, result, 'Training resource deactivated');
    });

    recordView = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        const result = await this.service.recordView(req.params.id, userId);
        return this.sendSuccess(res, result, 'View recorded');
    });

    myStats = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        const stats = await this.service.getUserStats(userId);
        return this.sendSuccess(res, stats, 'Training stats retrieved');
    });
}
