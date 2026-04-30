import { FilterQuery, Types } from 'mongoose';
import {
    Schedule,
    Session,
    CoachAvailability,
    RosterTemplate
} from './schedule.model';
import {
    ISchedule,
    ISession,
    ICoachAvailability,
    IRosterTemplate,
    IScheduleFilter,
    ISessionFilter,
    IScheduleGenerationRequest,
    IScheduleGenerationResult,
    IConflictResolution,
    ISubstituteSearchCriteria,
    ScheduleStatus,
    SessionStatus,
    ConflictType,
    ITimeSlot,
    IConflict
} from './schedule.interface';
import { BaseService, EntityContext } from '../../shared/base/base.service';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';

export class ScheduleService extends BaseService<ISchedule> {
    constructor() {
        super(Schedule, 'schedule');
    }

    protected getEntityContext(doc: any): EntityContext | null {
        return {
            organizationId: doc.businessUnitId?.toString(),
            locationId: doc.locationIds?.[0]?.toString(),
        };
    }

    /**
     * Get available sessions for public booking
     */
    async getAvailableSessions(filters: any): Promise<any[]> {
        try {
            // Find published or active schedules
            const activeSchedules = await Schedule.find({
                status: { $in: [ScheduleStatus.PUBLISHED, ScheduleStatus.ACTIVE] }
            }).select('_id');

            const scheduleIds = activeSchedules.map(s => s._id);

            if (scheduleIds.length === 0) {
                return [];
            }

            // Build session query
            const sessionQuery: FilterQuery<ISession> = {
                scheduleId: { $in: scheduleIds },
                status: { $in: [SessionStatus.SCHEDULED, SessionStatus.CONFIRMED] },
                date: { $gte: new Date() }
            };

            if (filters.startDate) {
                sessionQuery.date = { ...sessionQuery.date as any, $gte: filters.startDate };
            }
            if (filters.endDate) {
                sessionQuery.date = { ...sessionQuery.date as any, $lte: filters.endDate };
            }

            // Fetch sessions with populated references. Pull the real Program
            // fields (programType / pricingModel / ageGroups / skillLevels) so
            // the frontend can render true values instead of placeholders.
            const sessions = await Session.find(sessionQuery)
                .populate('programId', 'name programType category pricingModel ageGroups skillLevels')
                .populate('locationId', 'name address')
                .populate('coachAssignments.coachId', 'firstName lastName name')
                .sort({ date: 1, 'timeSlot.startTime': 1 })
                .limit(100);

            // Transform to frontend TimeSlot format
            return sessions.map(session => {
                const program: any = session.programId || {};
                const location: any = session.locationId || {};
                const primaryCoach = session.coachAssignments.find(ca => ca.role === 'primary');
                const coach: any = primaryCoach?.coachId || {};

                const booked = session.enrolledParticipants?.length || 0;
                const capacity = session.maxCapacity || 10;
                const waitlist = session.waitlistParticipants?.length || 0;

                let status: string = 'available';
                if (session.status === SessionStatus.CANCELLED) {
                    status = 'cancelled';
                } else if (booked >= capacity && waitlist > 0) {
                    status = 'waitlist';
                } else if (booked >= capacity) {
                    status = 'full';
                }

                // Build a human-friendly age-group label from the Program's
                // ageGroups array. Programs can target multiple bands, so we
                // pick the first defined one (which is enough for filter
                // dropdowns) and fall back to a generic label.
                const firstAgeGroup = Array.isArray(program.ageGroups) && program.ageGroups.length > 0
                    ? program.ageGroups[0]
                    : null;
                const ageGroupLabel = firstAgeGroup
                    ? (firstAgeGroup.description
                        || `${firstAgeGroup.minAge}-${firstAgeGroup.maxAge} ${firstAgeGroup.ageType || 'years'}`)
                    : 'All ages';

                // Real price from the program's pricing model. Falls back to
                // 0 only if pricing wasn't set up — the frontend renders 0 as
                // "FREE" which matches existing assessment / trial behavior.
                const price = Number(program?.pricingModel?.basePrice ?? 0);

                // Skill level for the slot card ("Beginner", "Intermediate"…).
                const level = Array.isArray(program.skillLevels) && program.skillLevels.length > 0
                    ? String(program.skillLevels[0])
                    : 'All levels';

                return {
                    id: session._id.toString(),
                    startTime: session.timeSlot?.startTime || '',
                    endTime: session.timeSlot?.endTime || '',
                    programType: program.programType || program.category || 'class',
                    programName: program.name || 'Session',
                    coach: coach.name || `${coach.firstName || ''} ${coach.lastName || ''}`.trim() || 'TBA',
                    location: location.name || 'TBA',
                    ageGroup: ageGroupLabel,
                    capacity,
                    booked,
                    waitlist,
                    price,
                    level,
                    status,
                    date: session.date?.toISOString().split('T')[0] || ''
                };
            }).filter(slot => {
                // Apply frontend filters
                if (filters.location && slot.location !== filters.location) return false;
                if (filters.programType && slot.programType !== filters.programType) return false;
                if (filters.ageGroup && slot.ageGroup !== filters.ageGroup) return false;
                if (filters.coach && slot.coach !== filters.coach) return false;
                return true;
            });
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get available sessions',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Generate schedule from programs and templates
     */
    async generateSchedule(request: IScheduleGenerationRequest, createdBy: string): Promise<IScheduleGenerationResult> {
        try {
            // Pre-flight: if admin picked specific weekdays AND the requested
            // date range doesn't contain ANY of those weekdays, fail fast with
            // a useful message — otherwise the loop in generateSessionsForProgram
            // silently produces 0 sessions and admin gets the generic
            // "produced 0 sessions" error with no idea why.
            const reqAny = request as any;
            const prefDays: number[] = Array.isArray(reqAny.preferredDays)
                ? reqAny.preferredDays.filter((d: any) => Number.isInteger(d) && d >= 0 && d <= 6)
                : [];
            if (prefDays.length > 0 && request.startDate && request.endDate) {
                const start = new Date(request.startDate);
                const end = new Date(request.endDate);
                const daysInRange = new Set<number>();
                const cur = new Date(start);
                while (cur <= end && daysInRange.size < 7) {
                    daysInRange.add(cur.getDay());
                    cur.setDate(cur.getDate() + 1);
                }
                const intersects = prefDays.some((d) => daysInRange.has(d));
                if (!intersects) {
                    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    const picked = prefDays.map((d) => dayNames[d]).join(', ');
                    const range = Array.from(daysInRange).sort().map((d) => dayNames[d]).join(', ');
                    throw new AppError(
                        `Selected weekdays (${picked}) don't fall within the date range (which only covers ${range}). Either widen the date range or pick weekdays inside it.`,
                        HTTP_STATUS.BAD_REQUEST
                    );
                }
            }

            // Resolve businessUnitId from the first program (was a bug: code used
            // programIds[0] AS the businessUnitId, which fails the ObjectId cast).
            const { Program } = require('../programs/program.model');
            const firstProgramId = (request.programIds || [])[0];
            const firstProgram = firstProgramId
                ? await Program.findById(firstProgramId).select('businessUnitId').lean().catch(() => null)
                : null;
            let businessUnitId: any = firstProgram?.businessUnitId;
            if (!businessUnitId) {
                // Fallback: derive from first location, then any active business unit.
                const { Location } = require('../bcms/location.model');
                const firstLocId = (request.locationIds || [])[0];
                const loc = firstLocId
                    ? await Location.findById(firstLocId).select('businessUnitId').lean().catch(() => null)
                    : null;
                businessUnitId = loc?.businessUnitId;
            }
            if (!businessUnitId) {
                const { BusinessUnit } = require('../bcms/business-unit.model');
                const anyBu = await BusinessUnit.findOne({ isDeleted: { $ne: true } }).select('_id').lean().catch(() => null);
                businessUnitId = anyBu?._id;
            }
            if (!businessUnitId) {
                throw new AppError(
                    'Cannot resolve businessUnitId — no program/location/business-unit found',
                    HTTP_STATUS.BAD_REQUEST
                );
            }

            // Resolve termId. The Schedule model requires it. If the caller didn't
            // supply one (e.g. admin "Generate Schedule" UI without a term picker),
            // either reuse an existing term that overlaps the requested dates, or
            // auto-create a lightweight ad-hoc Term so the schedule can be saved.
            let termId: any = request.termId;
            if (!termId) {
                const { Term } = require('../bcms/term.model');
                const existingTerm = await Term.findOne({
                    businessUnitId,
                    isDeleted: { $ne: true },
                    startDate: { $lte: request.endDate },
                    endDate: { $gte: request.startDate },
                }).select('_id').lean().catch(() => null);
                if (existingTerm?._id) {
                    termId = existingTerm._id;
                } else {
                    // Compute weeks (Term schema requires it; pre-save middleware
                    // runs after validation so we must set weeks ourselves).
                    const start = new Date(request.startDate);
                    const end = new Date(request.endDate);
                    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
                    const weeks = Math.max(1, Math.ceil(days / 7));

                    const adHocTerm = await Term.create({
                        name: `Ad-hoc Term ${new Date().toISOString().slice(0, 10)}`,
                        code: `ADHOC${Date.now().toString(36).toUpperCase()}`,
                        businessUnitId,
                        startDate: start,
                        endDate: end,
                        weeks,
                        isActive: true,
                        allowEnrollment: false,
                        createdBy,
                        updatedBy: createdBy,
                    }).catch((e: any) => {
                        console.error('Auto term create failed:', e?.message, e?.errors);
                        return null;
                    });
                    termId = adHocTerm?._id;
                }
            }
            if (!termId) {
                throw new AppError(
                    'termId required and could not be auto-created (provide termId in payload)',
                    HTTP_STATUS.BAD_REQUEST
                );
            }

            // Create new schedule
            const scheduleDoc: any = {
                name: `Schedule ${new Date().toISOString().slice(0, 10)}`,
                termId,
                businessUnitId,
                locationIds: request.locationIds,
                startDate: request.startDate,
                endDate: request.endDate,
                status: ScheduleStatus.DRAFT,
                generationSettings: request.settings,
                createdBy,
                updatedBy: createdBy
            };
            const schedule = new Schedule(scheduleDoc);

            await schedule.save();

            // Generate sessions for each program
            const sessions: ISession[] = [];
            const conflicts: IConflict[] = [];
            let successfulSessions = 0;
            let failedSessions = 0;
            const allErrorReasons = new Set<string>();

            for (const programId of request.programIds) {
                const programSessions: any = await this.generateSessionsForProgram(
                    programId,
                    schedule._id.toString(),
                    request,
                    createdBy
                );

                sessions.push(...programSessions.sessions);
                conflicts.push(...programSessions.conflicts);
                successfulSessions += programSessions.successful;
                failedSessions += programSessions.failed;
                if (programSessions.errorReasons instanceof Set) {
                    programSessions.errorReasons.forEach((r: string) => allErrorReasons.add(r));
                }
            }

            // If we created the schedule but ended up with zero sessions, the
            // admin's "Generate Schedule" effectively did nothing useful. Roll
            // back the schedule and surface a 400 with the actual cause so the
            // UI can display "no active coaches" / "no location" etc. instead
            // of a phantom draft schedule + empty calendar.
            if (sessions.length === 0) {
                await Schedule.deleteOne({ _id: schedule._id }).catch(() => null);
                const reason = allErrorReasons.size > 0
                    ? Array.from(allErrorReasons).join('; ')
                    : 'No sessions could be generated for the selected programs/dates.';
                throw new AppError(
                    `Schedule generation produced 0 sessions: ${reason}`,
                    HTTP_STATUS.BAD_REQUEST
                );
            }

            // Update schedule with sessions
            schedule.sessions = sessions.map(s => s._id);
            schedule.totalSessions = sessions.length;
            schedule.statistics.totalConflicts = conflicts.length;
            schedule.statistics.pendingConflicts = conflicts.length;

            await schedule.save();
            this.emitRealtimeEvent('generated', schedule);

            // Calculate statistics
            const statistics = await this.calculateScheduleStatistics(schedule._id.toString());

            return {
                scheduleId: schedule._id.toString(),
                totalSessions: sessions.length,
                successfulSessions,
                failedSessions,
                conflicts,
                warnings: Array.from(allErrorReasons),
                statistics
            };
        } catch (error: any) {
            // Preserve AppErrors (like the 400 from "weekdays don't intersect
            // range" or "produced 0 sessions") so the controller surfaces the
            // real cause + correct status code instead of always returning a
            // generic 500.
            if (error instanceof AppError) throw error;
            throw new AppError(
                error.message || 'Failed to generate schedule',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Publish schedule
     */
    async publishSchedule(scheduleId: string, publishedBy: string): Promise<ISchedule> {
        try {
            const schedule = await this.findById(scheduleId);
            if (!schedule) {
                throw new AppError('Schedule not found', HTTP_STATUS.NOT_FOUND);
            }

            if (schedule.status !== ScheduleStatus.DRAFT) {
                throw new AppError('Only draft schedules can be published', HTTP_STATUS.BAD_REQUEST);
            }

            // Check for critical conflicts
            const criticalConflicts = await this.getCriticalConflicts(scheduleId);
            if (criticalConflicts.length > 0) {
                throw new AppError(
                    'Cannot publish schedule with critical conflicts',
                    HTTP_STATUS.BAD_REQUEST
                );
            }

            schedule.status = ScheduleStatus.PUBLISHED;
            schedule.publishedAt = new Date();
            schedule.publishedBy = publishedBy;
            schedule.updatedBy = publishedBy;

            await schedule.save();
            this.emitRealtimeEvent('published', schedule);

            // Update all sessions to confirmed status
            await Session.updateMany(
                { scheduleId: schedule._id, status: SessionStatus.SCHEDULED },
                { status: SessionStatus.CONFIRMED }
            );

            return schedule;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to publish schedule',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Detect conflicts in schedule
     */
    async detectConflicts(scheduleId: string): Promise<IConflict[]> {
        try {
            const sessions = await Session.find({ scheduleId }).populate('coachAssignments.coachId');
            const conflicts: IConflict[] = [];

            // Check for coach double booking
            const coachConflicts = await this.detectCoachConflicts(sessions);
            conflicts.push(...coachConflicts);

            // Check for room double booking
            const roomConflicts = await this.detectRoomConflicts(sessions);
            conflicts.push(...roomConflicts);

            // Check for travel time violations
            const travelConflicts = await this.detectTravelTimeConflicts(sessions);
            conflicts.push(...travelConflicts);

            // Check for capacity issues
            const capacityConflicts = await this.detectCapacityConflicts(sessions);
            conflicts.push(...capacityConflicts);

            return conflicts;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to detect conflicts',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Resolve conflict
     */
    async resolveConflict(
        conflictId: string,
        resolution: IConflictResolution,
        resolvedBy: string
    ): Promise<void> {
        try {
            const session = await Session.findOne({ 'conflicts._id': conflictId });
            if (!session) {
                throw new AppError('Conflict not found', HTTP_STATUS.NOT_FOUND);
            }

            // @ts-ignore
            const conflict = session.conflicts.id(conflictId);
            if (!conflict) {
                throw new AppError('Conflict not found', HTTP_STATUS.NOT_FOUND);
            }

            // Apply resolution based on type
            switch (resolution.resolutionType) {
                case 'reschedule':
                    if (resolution.newTimeSlot) {
                        session.timeSlot = resolution.newTimeSlot;
                    }
                    break;
                case 'reassign_coach':
                    if (resolution.newCoachId) {
                        const primaryCoach = session.coachAssignments.find(ca => ca.role === 'primary');
                        if (primaryCoach) {
                            primaryCoach.coachId = resolution.newCoachId;
                        }
                    }
                    break;
                case 'change_room':
                    if (resolution.newRoomId) {
                        session.roomId = resolution.newRoomId;
                    }
                    break;
                case 'cancel':
                    session.status = SessionStatus.CANCELLED;
                    break;
            }

            // Mark conflict as resolved
            conflict.resolvedAt = new Date();
            conflict.resolvedBy = resolvedBy;

            await session.save();

            // Update schedule statistics
            await this.updateScheduleStatistics(session.scheduleId);
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to resolve conflict',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Find substitute coaches
     */
    async findSubstituteCoaches(criteria: ISubstituteSearchCriteria): Promise<any[]> {
        try {
            const session = await Session.findById(criteria.sessionId);
            if (!session) {
                throw new AppError('Session not found', HTTP_STATUS.NOT_FOUND);
            }

            // Find available coaches
            const availableCoaches = await CoachAvailability.find({
                locationId: criteria.locationId,
                effectiveFrom: { $lte: session.date },
                $or: [
                    { effectiveTo: { $exists: false } },
                    { effectiveTo: { $gte: session.date } }
                ],
                coachId: { $nin: criteria.excludeCoaches || [] }
            }).populate('coachId');

            const substitutes = [];

            for (const availability of availableCoaches) {
                // Check if coach is available at the time slot
                const isAvailable = await this.isCoachAvailable(
                    availability.coachId.toString(),
                    session.date,
                    criteria.timeSlot
                );

                if (isAvailable) {
                    // @ts-ignore - coachId is populated
                    const coach: any = availability.coachId;
                    substitutes.push({
                        coachId: coach._id,
                        coachName: coach.name,
                        skills: coach.skills || [],
                        rating: coach.rating || 0,
                        distance: 0 // Would calculate actual distance
                    });
                }
            }

            return substitutes.sort((a, b) => b.rating - a.rating);
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to find substitute coaches',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get coach schedule
     */
    async getCoachSchedule(
        coachId: string,
        startDate: Date,
        endDate: Date
    ): Promise<ISession[]> {
        try {
            return await Session.find({
                'coachAssignments.coachId': coachId,
                date: { $gte: startDate, $lte: endDate },
                status: { $nin: [SessionStatus.CANCELLED] }
            })
                .populate('programId', 'name category')
                .populate('locationId', 'name address')
                .populate('roomId', 'name')
                .sort({ date: 1, 'timeSlot.startTime': 1 });
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get coach schedule',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get room schedule
     */
    async getRoomSchedule(
        roomId: string,
        startDate: Date,
        endDate: Date
    ): Promise<ISession[]> {
        try {
            return await Session.find({
                roomId,
                date: { $gte: startDate, $lte: endDate },
                status: { $nin: [SessionStatus.CANCELLED] }
            })
                .populate('programId', 'name category')
                .populate('coachAssignments.coachId', 'firstName lastName')
                .sort({ date: 1, 'timeSlot.startTime': 1 });
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get room schedule',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Private helper methods

    private async generateSessionsForProgram(
        programId: string,
        scheduleId: string,
        request: IScheduleGenerationRequest,
        createdBy: string
    ): Promise<{
        sessions: ISession[];
        conflicts: IConflict[];
        successful: number;
        failed: number;
    }> {
        const sessions: ISession[] = [];
        const conflicts: IConflict[] = [];
        let successful = 0;
        let failed = 0;
        // Capture distinct creation errors so the caller can surface a real
        // reason ("no active coach", "location missing"...) to admin instead of
        // silently returning a schedule with 0 sessions. Without this, on a
        // freshly deployed environment the admin sees a draft schedule but an
        // empty calendar and has no idea what went wrong.
        const errorReasons = new Set<string>();

        // Get program details and roster template
        const program = await this.getProgram(programId);
        let template = await this.getRosterTemplate(programId);

        if (!program) {
            errorReasons.add(`Program ${programId} not found`);
            return { sessions, conflicts, successful, failed, errorReasons } as any;
        }

        // Form-level overrides — admin's Generate Schedule UI lets the user
        // pick preferred weekdays + start/end time, but those fields aren't on
        // IScheduleGenerationRequest yet, so read them through `as any`. They
        // shape both the synthesised fallback template AND any pre-existing
        // template (otherwise admin selections were silently discarded and the
        // service would generate 0 sessions when the chosen weekdays didn't
        // overlap the template's hard-coded ones).
        const reqAny = request as any;
        const adminPreferredDays: number[] = Array.isArray(reqAny.preferredDays)
            ? reqAny.preferredDays.filter((d: any) => Number.isInteger(d) && d >= 0 && d <= 6)
            : [];
        const adminStartTime: string | undefined = reqAny?.settings?.preferredStartTime;
        const adminEndTime: string | undefined = reqAny?.settings?.preferredEndTime;

        // Fallback: if no roster template exists, synthesise a minimal one
        // from the program's sessionDuration / sessionsPerWeek so admin's
        // "Generate Schedule" actually creates Sessions even when nobody has
        // set up a recurring template yet.
        if (!template) {
            const minutes = (program as any).sessionDuration || 60;
            const perWeek = Math.max(1, Math.min(7, (program as any).sessionsPerWeek || 1));
            const startTime = adminStartTime && /^\d{2}:\d{2}$/.test(adminStartTime) ? adminStartTime : '10:00';
            // Honour admin's preferred end time if it's a valid HH:MM AND comes
            // after the start time; otherwise compute one from session duration.
            let endTime: string;
            if (adminEndTime && /^\d{2}:\d{2}$/.test(adminEndTime) && adminEndTime > startTime) {
                endTime = adminEndTime;
            } else {
                const [sh, sm] = startTime.split(':').map(Number);
                const endTotal = sh * 60 + sm + minutes;
                endTime = `${String(Math.floor(endTotal / 60) % 24).padStart(2, '0')}:${String(endTotal % 60).padStart(2, '0')}`;
            }
            // Day source: admin's preferredDays beats the program's default rotation.
            const days = adminPreferredDays.length > 0
                ? adminPreferredDays
                : [1, 3, 5, 2, 4, 6, 0].slice(0, perWeek); // Mon, Wed, Fri, Tue, Thu, Sat, Sun
            template = {
                timeSlots: days.map((dow) => ({
                    dayOfWeek: dow,
                    startTime,
                    endTime,
                    duration: minutes,
                })),
                coachAssignments: [],
                rooms: [],
            } as any;
        } else if (adminPreferredDays.length > 0 && Array.isArray(template.timeSlots) && template.timeSlots.length > 0) {
            // Existing template: rebuild its timeSlots so each admin-picked
            // weekday gets one slot (preserving the template's start/end/
            // duration on the first slot). Without this, the admin form's day
            // picker had no effect on already-templated programs.
            const proto = template.timeSlots[0];
            template = {
                ...template,
                timeSlots: adminPreferredDays.map((dow) => ({
                    dayOfWeek: dow,
                    startTime: adminStartTime && /^\d{2}:\d{2}$/.test(adminStartTime) ? adminStartTime : proto.startTime,
                    endTime: adminEndTime && /^\d{2}:\d{2}$/.test(adminEndTime) ? adminEndTime : proto.endTime,
                    duration: (proto as any).duration,
                })),
            } as any;
        }

        // Generate sessions based on template
        const currentDate = new Date(request.startDate);
        const endDate = new Date(request.endDate);

        // Resolve a locationId from the request once (first locationId in request)
        const resolvedLocationId = (request.locationIds && request.locationIds[0]) || undefined;
        // termId comes through request — pass to session so termId is correct
        const resolvedTermId = (request as any).termId;
        // Admin-selected coach pool. We distribute these round-robin across the
        // sessions we generate; if empty, createSession falls back to "any
        // active COACH user" so deployments that haven't yet wired the new UI
        // continue to work.
        const adminCoachIds = Array.isArray(request.coachIds)
            ? request.coachIds.filter(Boolean)
            : [];
        let coachCursor = 0;

        while (currentDate <= endDate) {
            for (const timeSlot of template.timeSlots) {
                if (currentDate.getDay() === timeSlot.dayOfWeek) {
                    // Pick the next coach in the rotation. Skipping when the
                    // pool is empty leaves coachIds undefined → createSession
                    // does its own auto-pick.
                    const coachId = adminCoachIds.length > 0
                        ? adminCoachIds[coachCursor++ % adminCoachIds.length]
                        : undefined;
                    try {
                        const session = await this.createSession({
                            programId,
                            scheduleId,
                            date: new Date(currentDate),
                            timeSlot,
                            template,
                            locationId: resolvedLocationId,
                            termId: resolvedTermId,
                            coachId,
                            createdBy
                        });

                        sessions.push(session);
                        successful++;
                    } catch (error: any) {
                        failed++;
                        // Convert mongoose validation errors into a one-line
                        // human cause that admin can act on. Repeated identical
                        // failures collapse to a single reason via the Set.
                        const cause = humaniseSessionCreateError(error);
                        errorReasons.add(cause);
                        conflicts.push({
                            type: ConflictType.TIME_OVERLAP,
                            severity: 'medium',
                            description: `Failed to create session: ${cause}`,
                            affectedSessions: []
                        });
                    }
                }
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return { sessions, conflicts, successful, failed, errorReasons } as any;
    }

    private async createSession(params: {
        programId: string;
        scheduleId: string;
        date: Date;
        timeSlot: ITimeSlot;
        template: IRosterTemplate;
        locationId?: string;
        termId?: string;
        coachId?: string;
        createdBy: string;
    }): Promise<ISession> {
        const sessionId = `${params.programId}-${params.date.toISOString().split('T')[0]}-${params.timeSlot.startTime}`;

        // Resolve duration: timeSlot first (set by admin shim's fallback template),
        // then template.sessionDuration, then default 60.
        const duration = (params.timeSlot as any).duration
            || (params.template as any).sessionDuration
            || 60;

        // Resolve locationId: explicit param wins, then template default, then any active.
        let locationId: any = params.locationId
            || (params.template as any).defaultLocationId
            || ((params.template as any).rooms?.[0]?.locationId);
        if (!locationId) {
            const { Location } = require('../bcms/location.model');
            const loc = await Location.findOne({ isDeleted: { $ne: true } }).select('_id').lean().catch(() => null);
            locationId = loc?._id;
        }

        // Resolve coach: explicit param wins, then template assignment, then any
        // user with COACH role. Session schema requires at least one coachAssignment.
        let coachId: any = params.coachId
            || ((params.template as any).coachAssignments?.[0]?.coachId);
        if (!coachId) {
            const { User } = require('../iam/user.model');
            const aCoach = await User.findOne({ role: 'COACH', status: 'ACTIVE', isDeleted: { $ne: true } }).select('_id').lean().catch(() => null);
            coachId = aCoach?._id;
        }
        const coachAssignments = coachId
            ? [{ coachId, role: 'primary' }]
            : [];

        const session = new Session({
            sessionId,
            programId: params.programId,
            termId: params.termId || params.scheduleId,
            scheduleId: params.scheduleId,
            date: params.date,
            timeSlot: params.timeSlot,
            duration,
            locationId,
            resourceRequirements: (params.template as any).defaultResourceRequirements || [],
            coachAssignments,
            enrolledParticipants: [],
            maxCapacity: (params.template as any).maxCapacity || 10,
            waitlistParticipants: [],
            status: 'scheduled',
            createdBy: params.createdBy,
            updatedBy: params.createdBy
        });

        await session.save();
        return session;
    }

    private async detectCoachConflicts(sessions: ISession[]): Promise<IConflict[]> {
        const conflicts: IConflict[] = [];
        const coachSessions = new Map<string, ISession[]>();

        // Group sessions by coach
        for (const session of sessions) {
            for (const assignment of session.coachAssignments) {
                const coachId = assignment.coachId.toString();
                if (!coachSessions.has(coachId)) {
                    coachSessions.set(coachId, []);
                }
                coachSessions.get(coachId)!.push(session);
            }
        }

        // Check for overlapping sessions
        for (const [coachId, coachSessionList] of coachSessions) {
            for (let i = 0; i < coachSessionList.length; i++) {
                for (let j = i + 1; j < coachSessionList.length; j++) {
                    const session1 = coachSessionList[i];
                    const session2 = coachSessionList[j];

                    if (this.sessionsOverlap(session1, session2)) {
                        conflicts.push({
                            type: ConflictType.COACH_DOUBLE_BOOKING,
                            severity: 'high',
                            description: `Coach ${coachId} is double booked`,
                            affectedSessions: [session1._id.toString(), session2._id.toString()]
                        });
                    }
                }
            }
        }

        return conflicts;
    }

    private async detectRoomConflicts(sessions: ISession[]): Promise<IConflict[]> {
        const conflicts: IConflict[] = [];
        const roomSessions = new Map<string, ISession[]>();

        // Group sessions by room
        for (const session of sessions) {
            if (session.roomId) {
                const roomId = session.roomId.toString();
                if (!roomSessions.has(roomId)) {
                    roomSessions.set(roomId, []);
                }
                roomSessions.get(roomId)!.push(session);
            }
        }

        // Check for overlapping sessions
        for (const [roomId, roomSessionList] of roomSessions) {
            for (let i = 0; i < roomSessionList.length; i++) {
                for (let j = i + 1; j < roomSessionList.length; j++) {
                    const session1 = roomSessionList[i];
                    const session2 = roomSessionList[j];

                    if (this.sessionsOverlap(session1, session2)) {
                        conflicts.push({
                            type: ConflictType.ROOM_DOUBLE_BOOKING,
                            severity: 'high',
                            description: `Room ${roomId} is double booked`,
                            affectedSessions: [session1._id.toString(), session2._id.toString()]
                        });
                    }
                }
            }
        }

        return conflicts;
    }

    private async detectTravelTimeConflicts(sessions: ISession[]): Promise<IConflict[]> {
        // Implementation for travel time conflict detection
        return [];
    }

    private async detectCapacityConflicts(sessions: ISession[]): Promise<IConflict[]> {
        const conflicts: IConflict[] = [];

        for (const session of sessions) {
            if (session.enrolledParticipants.length > session.maxCapacity) {
                conflicts.push({
                    type: ConflictType.CAPACITY_EXCEEDED,
                    severity: 'medium',
                    description: `Session capacity exceeded: ${session.enrolledParticipants.length}/${session.maxCapacity}`,
                    affectedSessions: [session._id.toString()]
                });
            }
        }

        return conflicts;
    }

    private sessionsOverlap(session1: ISession, session2: ISession): boolean {
        if (session1.date.toDateString() !== session2.date.toDateString()) {
            return false;
        }

        const start1 = this.timeToMinutes(session1.timeSlot.startTime);
        const end1 = this.timeToMinutes(session1.timeSlot.endTime);
        const start2 = this.timeToMinutes(session2.timeSlot.startTime);
        const end2 = this.timeToMinutes(session2.timeSlot.endTime);

        return start1 < end2 && start2 < end1;
    }

    private timeToMinutes(time: string): number {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    private async isCoachAvailable(
        coachId: string,
        date: Date,
        timeSlot: ITimeSlot
    ): Promise<boolean> {
        // Check coach availability
        const availability = await CoachAvailability.findOne({
            coachId,
            effectiveFrom: { $lte: date },
            $or: [
                { effectiveTo: { $exists: false } },
                { effectiveTo: { $gte: date } }
            ]
        });

        if (!availability) {
            return false;
        }

        // Check if coach is available on this day and time
        const dayOfWeek = date.getDay();
        const availableSlot = availability.weeklyAvailability.find(slot =>
            slot.dayOfWeek === dayOfWeek &&
            slot.isAvailable &&
            this.timeToMinutes(slot.startTime) <= this.timeToMinutes(timeSlot.startTime) &&
            this.timeToMinutes(slot.endTime) >= this.timeToMinutes(timeSlot.endTime)
        );

        return !!availableSlot;
    }

    private async getCriticalConflicts(scheduleId: string): Promise<IConflict[]> {
        const sessions = await Session.find({ scheduleId });
        const allConflicts: IConflict[] = [];

        for (const session of sessions) {
            const criticalConflicts = session.conflicts.filter(c => c.severity === 'critical');
            allConflicts.push(...criticalConflicts);
        }

        return allConflicts;
    }

    private async calculateScheduleStatistics(scheduleId: string): Promise<any> {
        // Implementation for calculating schedule statistics
        return {
            coachUtilization: {},
            roomUtilization: {},
            timeSlotDistribution: {}
        };
    }

    private async updateScheduleStatistics(scheduleId: string): Promise<void> {
        // Implementation for updating schedule statistics
    }

    private async getProgram(programId: string): Promise<any> {
        // This would fetch from Program model
        return { id: programId };
    }

    private async getRosterTemplate(programId: string): Promise<IRosterTemplate | null> {
        return await RosterTemplate.findOne({ programId, isActive: true });
    }
}

// Translate raw mongoose / driver errors thrown by Session.save() into a single
// short cause-line that admin can act on. The most common silent failures on a
// fresh deployment are the validators on `coachAssignments` (no active coach
// in the DB) and `locationId` (no location seeded), so we recognise those
// explicitly. Anything else falls through to the raw message.
function humaniseSessionCreateError(error: any): string {
    if (!error) return 'Unknown error';
    const msg = String(error?.message || error);

    if (/coach assignment is required/i.test(msg) || /coachAssignments/.test(msg)) {
        return 'No active coaches available — add at least one coach (status=ACTIVE) before generating a schedule';
    }
    if (/Location ID is required/i.test(msg) || /locationId/.test(msg)) {
        return 'No location available — add at least one location for this business unit before generating a schedule';
    }
    if (/Max capacity is required/i.test(msg)) {
        return 'Program is missing capacity rules — set maxCapacity on the program';
    }
    if (/Duration is required/i.test(msg)) {
        return 'Program is missing sessionDuration — update the program before generating a schedule';
    }
    if (/duplicate key/i.test(msg) && /sessionId/.test(msg)) {
        return 'Duplicate session detected — a schedule for this program/date/time already exists';
    }
    return msg;
}
