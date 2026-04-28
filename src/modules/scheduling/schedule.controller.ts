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
     * Get available sessions for booking (public)
     */
    getAvailableSessions = asyncHandler(async (req: Request, res: Response) => {
        const filters: any = {};

        if (req.query.location) filters.location = req.query.location;
        if (req.query.programType) filters.programType = req.query.programType;
        if (req.query.ageGroup) filters.ageGroup = req.query.ageGroup;
        if (req.query.coach) filters.coach = req.query.coach;
        if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
        if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);

        const sessions = await this.scheduleService.getAvailableSessions(filters);

        ResponseUtil.success(res, sessions, 'Available sessions retrieved successfully');
    });

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
        const filters = this.buildScheduleFilters(req.query);

        const result = await this.scheduleService.findWithPagination(filters, req.query);

        ResponseUtil.success(res, result, 'Schedules retrieved successfully');
    });

    /**
     * Get schedule by ID
     */
    getScheduleById = asyncHandler(async (req: Request, res: Response) => {
        // Hand-rolled query so we can populate sessions + their programs/locations
        // — admin "view schedule" drawer needs the full session list with names
        // and times, not just session IDs.
        const { Schedule, Session } = require('./schedule.model');
        const schedule = await Schedule.findOne({ _id: req.params.id, isDeleted: { $ne: true } })
            .populate({ path: 'locationIds', select: 'name code' })
            .populate({ path: 'termId', select: 'name termName' })
            .lean();
        if (!schedule) {
            throw new AppError('Schedule not found', HTTP_STATUS.NOT_FOUND);
        }

        // Pull all sessions belonging to this schedule, sorted chronologically
        const sessions = await Session.find({
            scheduleId: schedule._id,
            isDeleted: { $ne: true },
        })
            .populate({ path: 'programId', select: 'name title programType' })
            .populate({ path: 'locationId', select: 'name code' })
            .populate({ path: 'coachAssignments.coachId', select: 'firstName lastName name email' })
            .sort({ date: 1, 'timeSlot.startTime': 1 })
            .lean();

        // Project a compact, frontend-friendly shape for each session
        const sessionsList = sessions.map((s: any) => {
            const program: any = s.programId && typeof s.programId === 'object' ? s.programId : null;
            const location: any = s.locationId && typeof s.locationId === 'object' ? s.locationId : null;
            const primary = (s.coachAssignments || []).find((c: any) => c.role === 'primary') || (s.coachAssignments || [])[0];
            const coach: any = primary?.coachId && typeof primary.coachId === 'object' ? primary.coachId : null;
            return {
                id: s._id?.toString?.() || s._id,
                date: s.date,
                startTime: s.timeSlot?.startTime || '',
                endTime: s.timeSlot?.endTime || '',
                programName: program ? (program.name || program.title) : '',
                programType: program?.programType || '',
                locationName: location ? location.name : '',
                coachName: coach ? (coach.name || `${coach.firstName || ''} ${coach.lastName || ''}`.trim() || coach.email) : 'Unassigned',
                status: s.status,
                enrolled: Array.isArray(s.enrolledParticipants) ? s.enrolledParticipants.length : 0,
                capacity: s.maxCapacity || 0,
            };
        });

        const term: any = schedule.termId && typeof schedule.termId === 'object' ? schedule.termId : null;
        const locations: any[] = Array.isArray(schedule.locationIds) ? schedule.locationIds : [];

        ResponseUtil.success(res, {
            ...schedule,
            id: schedule._id?.toString?.() || schedule._id,
            termName: term ? (term.name || term.termName) : '',
            locationNames: locations.map((l: any) => (l && typeof l === 'object' ? l.name : '')).filter(Boolean),
            sessionsList,
        }, 'Schedule retrieved successfully');
    });

    /**
     * Admin "all sessions" — flat list of every Session across every schedule,
     * populated for calendar rendering. The list endpoint returns SCHEDULE
     * containers; this returns the underlying SESSIONS so the calendar can
     * place each session in its real day/time cell instead of falling back to
     * the schedule's container defaults.
     */
    getAllSessions = asyncHandler(async (req: Request, res: Response) => {
        const { Schedule, Session } = require('./schedule.model');

        const filter: any = { isDeleted: { $ne: true } };
        if (req.query.scheduleId) filter.scheduleId = req.query.scheduleId;
        if (req.query.status) filter.status = req.query.status;
        if (req.query.startDate || req.query.endDate) {
            filter.date = {} as any;
            if (req.query.startDate) filter.date.$gte = new Date(req.query.startDate as string);
            if (req.query.endDate) filter.date.$lt = new Date(req.query.endDate as string);
        }

        const sessions = await Session.find(filter)
            .populate({ path: 'programId', select: 'name programType' })
            .populate({ path: 'locationId', select: 'name code' })
            .populate({ path: 'coachAssignments.coachId', select: 'firstName lastName name email' })
            .sort({ date: 1, 'timeSlot.startTime': 1 })
            .limit(500)
            .lean();

        // Pull schedule names in one batch so each session can carry its parent's name.
        const scheduleIds = Array.from(new Set(sessions.map((s: any) => String(s.scheduleId)).filter(Boolean)));
        const schedules = await Schedule.find({ _id: { $in: scheduleIds } })
            .select('name status')
            .lean();
        const scheduleMap = new Map<string, any>();
        schedules.forEach((sc: any) => scheduleMap.set(String(sc._id), sc));

        const result = sessions.map((s: any) => {
            const program: any = s.programId && typeof s.programId === 'object' ? s.programId : null;
            const location: any = s.locationId && typeof s.locationId === 'object' ? s.locationId : null;
            const primary = (s.coachAssignments || []).find((c: any) => c.role === 'primary') || (s.coachAssignments || [])[0];
            const coach: any = primary?.coachId && typeof primary.coachId === 'object' ? primary.coachId : null;
            const parent = scheduleMap.get(String(s.scheduleId));

            const date = s.date ? new Date(s.date) : null;
            return {
                id: String(s._id),
                scheduleId: String(s.scheduleId || ''),
                scheduleName: parent?.name || '',
                scheduleStatus: parent?.status || '',
                date: date,
                dayOfWeek: date ? date.getDay() : (s.timeSlot?.dayOfWeek ?? 0),
                startTime: s.timeSlot?.startTime || '',
                endTime: s.timeSlot?.endTime || '',
                duration: s.duration || 0,
                programName: program ? program.name : '',
                programType: program?.programType || '',
                locationName: location ? location.name : '',
                coachName: coach
                    ? (coach.name || `${coach.firstName || ''} ${coach.lastName || ''}`.trim() || coach.email)
                    : 'Unassigned',
                status: s.status || 'scheduled',
                enrolled: Array.isArray(s.enrolledParticipants) ? s.enrolledParticipants.length : 0,
                capacity: s.maxCapacity || 0,
            };
        });

        ResponseUtil.success(res, result, 'Sessions retrieved successfully');
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
