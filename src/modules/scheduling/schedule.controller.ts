import { Request, Response } from 'express';
import { ScheduleService } from './schedule.service';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';
import { ResponseUtil } from '../../shared/utils/response.util';
import { PaginationUtil } from '../../shared/utils/pagination.util';

export class ScheduleController {
    private scheduleService: ScheduleService;

    constructor() {
        this.scheduleService = new ScheduleService();
    }

    /**
     * Generate new schedule
     */
    generateSchedule = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.scheduleService.generateSchedule(
            req.body,
            req.user.id
        );

        ResponseUtil.success(res, result, 'Schedule generated successfully', HTTP_STATUS.CREATED);
    });

    /**
     * Get all schedules
     */
    getSchedules = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit, skip } = PaginationUtil.getPaginationParams(req.query);
        const filters = this.buildScheduleFilters(req.query);

        const { data, total } = await this.scheduleService.getAll(filters, {
            page,
            limit,
            skip,
            sort: { createdAt: -1 }
        });

        const meta = PaginationUtil.buildMeta(total, page, limit);

        ResponseUtil.success(res, data, 'Schedules retrieved successfully', HTTP_STATUS.OK, meta);
    });

    /**
     * Get schedule by ID
     */
    getScheduleById = asyncHandler(async (req: Request, res: Response) => {
        const schedule = await this.scheduleService.getById(req.params.id);
        if (!schedule) {
            throw new AppError('Schedule not found', HTTP_STATUS.NOT_FOUND);
        }

        ResponseUtil.success(res, schedule, 'Schedule retrieved successfully');
    });

    /**
     * Update schedule
     */
    updateSchedule = asyncHandler(async (req: Request, res: Response) => {
        const schedule = await this.scheduleService.update(
            req.params.id,
            { ...req.body, updatedBy: req.user.id }
        );

        ResponseUtil.success(res, schedule, 'Schedule updated successfully');
    });

    /**
     * Delete schedule
     */
    deleteSchedule = asyncHandler(async (req: Request, res: Response) => {
        await this.scheduleService.delete(req.params.id);
        ResponseUtil.success(res, null, 'Schedule deleted successfully');
    });

    /**
     * Publish schedule
     */
    publishSchedule = asyncHandler(async (req: Request, res: Response) => {
        const schedule = await this.scheduleService.publishSchedule(
            req.params.id,
            req.user.id
        );

        ResponseUtil.success(res, schedule, 'Schedule published successfully');
    });

    /**
     * Detect conflicts in schedule
     */
    detectConflicts = asyncHandler(async (req: Request, res: Response) => {
        const conflicts = await this.scheduleService.detectConflicts(req.params.id);
        ResponseUtil.success(res, conflicts, 'Conflicts detected successfully');
    });

    /**
     * Resolve conflict
     */
    resolveConflict = asyncHandler(async (req: Request, res: Response) => {
        await this.scheduleService.resolveConflict(
            req.params.conflictId,
            req.body,
            req.user.id
        );

        ResponseUtil.success(res, null, 'Conflict resolved successfully');
    });

    /**
     * Get coach schedule
     */
    getCoachSchedule = asyncHandler(async (req: Request, res: Response) => {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            throw new AppError('Start date and end date are required', HTTP_STATUS.BAD_REQUEST);
        }

        const schedule = await this.scheduleService.getCoachSchedule(
            req.params.coachId,
            new Date(startDate as string),
            new Date(endDate as string)
        );

        ResponseUtil.success(res, schedule, 'Coach schedule retrieved successfully');
    });

    /**
     * Get room schedule
     */
    getRoomSchedule = asyncHandler(async (req: Request, res: Response) => {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            throw new AppError('Start date and end date are required', HTTP_STATUS.BAD_REQUEST);
        }

        const schedule = await this.scheduleService.getRoomSchedule(
            req.params.roomId,
            new Date(startDate as string),
            new Date(endDate as string)
        );

        ResponseUtil.success(res, schedule, 'Room schedule retrieved successfully');
    });

    /**
     * Find substitute coaches
     */
    findSubstituteCoaches = asyncHandler(async (req: Request, res: Response) => {
        const substitutes = await this.scheduleService.findSubstituteCoaches({
            sessionId: req.params.sessionId,
            ...req.body
        });

        ResponseUtil.success(res, substitutes, 'Substitute coaches found successfully');
    });

    private buildScheduleFilters(query: any) {
        const filters: any = {};

        if (query.termId) filters.termId = query.termId;
        if (query.businessUnitId) filters.businessUnitId = query.businessUnitId;
        if (query.locationId) filters.locationIds = query.locationId;
        if (query.status) filters.status = query.status;
        if (query.hasConflicts === 'true') {
            filters['statistics.pendingConflicts'] = { $gt: 0 };
        }

        if (query.startDate || query.endDate) {
            filters.dateRange = {};
            if (query.startDate) filters.dateRange.startDate = new Date(query.startDate);
            if (query.endDate) filters.dateRange.endDate = new Date(query.endDate);
        }

        return filters;
    }
}